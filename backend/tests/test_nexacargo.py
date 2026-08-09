"""
NexaCargo Logistics Platform — Comprehensive Test Suite

UNIT TESTS:
  - Security utilities (password hashing, JWT creation/verification)
  - Helper functions (tracking ID generation, serialization, email validation)
  - Pydantic schema validation (all request payloads)
  - CORS configuration logic

INTEGRATION TESTS:
  - FastAPI application lifecycle and health endpoints
  - Auth API routes (register, login, me, refresh, logout, password reset)
  - Quotes API CRUD operations
  - Shipments API CRUD operations
  - Full user registration -> login -> authenticated request flow
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch, PropertyMock

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Ensure backend is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set test environment variables BEFORE importing app modules
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only-12345")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test_nexacargo.db")
os.environ.setdefault("SUPABASE_URL", "")
os.environ.setdefault("SUPABASE_ANON_KEY", "")
os.environ.setdefault("SUPABASE_JWT_SECRET", "")

from app.core.config import settings, is_origin_allowed
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
    TokenError,
    _pw_bytes,
    _normalise,
)
from app.core.database import Base, get_db
from app.utils.helpers import (
    generate_tracking_id,
    generate_ref,
    validate_email,
    serialize,
    serialize_all,
    now_iso,
    is_safe_file_url,
)
from app.models.profile import UserRole, Profile


# =============================================================================
# UNIT TESTS -- Security Module
# =============================================================================

class TestPasswordHashing:
    """Unit tests for bcrypt password hashing and verification."""

    def test_hash_password_returns_string(self):
        result = hash_password("testpassword123")
        assert isinstance(result, str)
        assert len(result) > 0

    def test_hash_password_produces_different_salts(self):
        hash1 = hash_password("samepassword")
        hash2 = hash_password("samepassword")
        assert hash1 != hash2

    def test_verify_password_correct(self):
        password = "securePass123"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        hashed = hash_password("correctpassword")
        assert verify_password("wrongpassword", hashed) is False

    def test_verify_password_none_hash(self):
        assert verify_password("anypassword", None) is False

    def test_verify_password_empty_hash(self):
        assert verify_password("anypassword", "") is False

    def test_verify_password_invalid_hash(self):
        assert verify_password("password", "not-a-valid-hash") is False

    def test_long_password_handling(self):
        long_password = "a" * 100
        hashed = hash_password(long_password)
        assert verify_password(long_password, hashed) is True

    def test_unicode_password(self):
        password = "pässwörd123"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True


class TestJWTTokenCreation:
    """Unit tests for JWT token creation and verification."""

    def test_create_access_token_basic(self):
        token = create_access_token(
            subject="user-123",
            email="test@example.com",
            role="customer",
        )
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_contains_required_claims(self):
        token = create_access_token(
            subject="user-456",
            email="user@test.com",
            role="admin",
            name="Test User",
        )
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_ISSUER,
        )
        assert payload["sub"] == "user-456"
        assert payload["email"] == "user@test.com"
        assert payload["role"] == "admin"
        assert payload["name"] == "Test User"
        assert "exp" in payload
        assert "iat" in payload

    def test_create_access_token_custom_expiry(self):
        token = create_access_token(
            subject="user-789",
            email="test@test.com",
            role="customer",
            expires_minutes=5,
        )
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_ISSUER,
        )
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        iat_time = datetime.fromtimestamp(payload["iat"], tz=timezone.utc)
        delta = (exp_time - iat_time).total_seconds()
        assert 290 <= delta <= 310

    def test_create_access_token_no_secret_raises(self):
        with patch.object(settings, "JWT_SECRET", ""):
            with pytest.raises(TokenError, match="not configured"):
                create_access_token(subject="x", email="y", role="z")

    def test_create_password_reset_token(self):
        token = create_password_reset_token("user-123")
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_ISSUER,
        )
        assert payload["sub"] == "user-123"
        assert payload["purpose"] == "pwd_reset"

    def test_verify_password_reset_token_valid(self):
        token = create_password_reset_token("user-456")
        result = verify_password_reset_token(token)
        assert result == "user-456"

    def test_verify_password_reset_token_expired(self):
        token = create_password_reset_token("user-789", expires_minutes=-1)
        with pytest.raises(TokenError, match="Invalid or expired"):
            verify_password_reset_token(token)

    def test_verify_password_reset_token_wrong_purpose(self):
        token = create_access_token(subject="user", email="e", role="customer")
        with pytest.raises(TokenError, match="Invalid reset token"):
            verify_password_reset_token(token)

    def test_verify_password_reset_token_no_secret_raises(self):
        with patch.object(settings, "JWT_SECRET", ""):
            with pytest.raises(TokenError, match="not configured"):
                verify_password_reset_token("some-token")


class TestPwBytes:
    """Unit tests for the internal _pw_bytes helper."""

    def test_short_password_returns_utf8(self):
        result = _pw_bytes("short")
        assert result == b"short"

    def test_exactly_72_bytes(self):
        password = "a" * 72
        result = _pw_bytes(password)
        assert result == password.encode("utf-8")

    def test_over_72_bytes_uses_sha256(self):
        password = "a" * 73
        result = _pw_bytes(password)
        assert len(result) == 32  # SHA-256 digest size


class TestNormalise:
    """Unit tests for the _normalise helper."""

    def test_normalise_with_user_metadata(self):
        payload = {
            "sub": "user-1",
            "email": "test@test.com",
            "user_metadata": {"role": "admin", "name": "Admin User"},
        }
        result = _normalise(payload)
        assert result["id"] == "user-1"
        assert result["email"] == "test@test.com"
        assert result["role"] == "admin"
        assert result["name"] == "Admin User"

    def test_normalise_with_raw_user_meta_data(self):
        payload = {
            "id": "user-2",
            "email": "raw@test.com",
            "raw_user_meta_data": {"role": "driver", "name": "Driver"},
        }
        result = _normalise(payload)
        assert result["id"] == "user-2"
        assert result["role"] == "driver"

    def test_normalise_defaults_to_customer(self):
        payload = {"sub": "user-3", "email": "x@y.com"}
        result = _normalise(payload)
        assert result["role"] == "customer"


# =============================================================================
# UNIT TESTS -- Helper Functions
# =============================================================================

class TestGenerateTrackingId:
    """Unit tests for tracking ID generation."""

    def test_format(self):
        tracking_id = generate_tracking_id()
        assert tracking_id.startswith("SHP-")
        assert len(tracking_id) == 10  # "SHP-" + 6 hex chars

    def test_uniqueness(self):
        ids = {generate_tracking_id() for _ in range(100)}
        assert len(ids) == 100

    def test_uppercase(self):
        tracking_id = generate_tracking_id()
        assert tracking_id == tracking_id.upper()


class TestGenerateRef:
    """Unit tests for generic reference generation."""

    def test_custom_prefix(self):
        ref = generate_ref("INV")
        assert ref.startswith("INV-")

    def test_custom_length(self):
        ref = generate_ref("QTE", n=4)
        assert len(ref) == 8  # "QTE-" + 4 hex chars

    def test_uniqueness(self):
        refs = {generate_ref("TST") for _ in range(100)}
        assert len(refs) == 100


class TestValidateEmail:
    """Unit tests for email validation."""

    @pytest.mark.parametrize("email", [
        "user@example.com",
        "test.email@domain.org",
        "user+tag@example.co.uk",
        "a@b.cc",
        "user123@test.io",
    ])
    def test_valid_emails(self, email):
        assert validate_email(email) is True, f"Expected {email} to be valid"

    @pytest.mark.parametrize("email", [
        "",
        "notanemail",
        "@nodomain.com",
        "noat.sign",
        "missing@tld",
        "@@@.com",
    ])
    def test_invalid_emails(self, email):
        assert validate_email(email) is False, f"Expected {email} to be invalid"


class TestSerialize:
    """Unit tests for model serialization."""

    def _make_mock_obj(self, columns_data):
        """Create a mock SQLAlchemy model with given column data."""
        mock_cols = []
        for col_name, value in columns_data.items():
            col = MagicMock()
            col.name = col_name
            mock_cols.append(col)

        mock_obj = MagicMock()
        mock_table = MagicMock()
        mock_table.columns = mock_cols
        mock_obj.__table__ = mock_table

        # Set attribute values
        for col_name, value in columns_data.items():
            setattr(mock_obj, col_name, value)

        return mock_obj

    def test_serialize_excludes_password_hash(self):
        mock_obj = self._make_mock_obj({
            "password_hash": "secret_hash",
            "email": "test@example.com",
        })
        result = serialize(mock_obj)
        assert "password_hash" not in result
        assert result["email"] == "test@example.com"

    def test_serialize_uuid_to_string(self):
        test_uuid = uuid.uuid4()
        mock_obj = self._make_mock_obj({"id": test_uuid})
        result = serialize(mock_obj)
        assert result["id"] == str(test_uuid)

    def test_serialize_datetime_to_iso(self):
        now = datetime.now(timezone.utc)
        mock_obj = self._make_mock_obj({"created_at": now})
        result = serialize(mock_obj)
        assert result["created_at"] == now.isoformat()

    def test_serialize_all(self):
        obj1 = self._make_mock_obj({"name": "Item 1"})
        obj2 = self._make_mock_obj({"name": "Item 2"})
        result = serialize_all([obj1, obj2])
        assert len(result) == 2
        assert result[0]["name"] == "Item 1"
        assert result[1]["name"] == "Item 2"


class TestNowIso:
    """Unit tests for now_iso helper."""

    def test_returns_iso_format(self):
        result = now_iso()
        assert isinstance(result, str)
        parsed = datetime.fromisoformat(result)
        assert parsed.tzinfo is not None


class TestIsSafeFileUrl:
    """Unit tests for file URL safety validation."""

    def test_empty_url(self):
        assert is_safe_file_url("") is False

    def test_localhost_url(self):
        assert is_safe_file_url("http://localhost:8000/file.pdf") is True

    def test_127_url(self):
        assert is_safe_file_url("http://127.0.0.1:8000/file.pdf") is True

    def test_supabase_url(self):
        assert is_safe_file_url("https://xyz.supabase.co/storage/file.pdf") is True

    def test_supabase_co_domain(self):
        assert is_safe_file_url("https://supabase.co/something") is True

    def test_untrusted_host(self):
        assert is_safe_file_url("https://evil.com/file.pdf") is False

    def test_ftp_scheme(self):
        assert is_safe_file_url("ftp://localhost/file.pdf") is False

    def test_no_host(self):
        assert is_safe_file_url("http:///path") is False


# =============================================================================
# UNIT TESTS -- CORS Configuration
# =============================================================================

class TestCorsConfig:
    """Unit tests for CORS origin validation."""

    def test_wildcard_allowed(self):
        assert is_origin_allowed("https://any.com", ["*"]) is True

    def test_explicit_origin_allowed(self):
        assert is_origin_allowed("https://example.com", ["https://example.com"]) is True

    def test_localhost_pattern_allowed(self):
        assert is_origin_allowed("http://localhost:3000", []) is True

    def test_127_pattern_allowed(self):
        assert is_origin_allowed("http://127.0.0.1:8080", []) is True

    def test_vercel_pattern_allowed(self):
        assert is_origin_allowed("https://ncl-app.vercel.app", []) is True

    def test_render_pattern_allowed(self):
        assert is_origin_allowed("https://ncl-nexacargologistics-3.onrender.com", []) is True

    def test_untrusted_origin_denied(self):
        assert is_origin_allowed("https://evil.com", []) is False


# =============================================================================
# UNIT TESTS -- UserRole Constants
# =============================================================================

class TestUserRole:
    """Unit tests for UserRole constants."""

    def test_all_roles_defined(self):
        expected = {"admin", "customer", "finance", "logistics", "warehouse", "driver", "support", "customs"}
        assert UserRole.ALL == expected

    def test_staff_excludes_customer(self):
        assert "customer" not in UserRole.STAFF
        assert "admin" in UserRole.STAFF

    def test_role_values(self):
        assert UserRole.ADMIN == "admin"
        assert UserRole.CUSTOMER == "customer"
        assert UserRole.DRIVER == "driver"


# =============================================================================
# UNIT TESTS -- Pydantic Schema Validation
# =============================================================================

class TestPydanticSchemas:
    """Unit tests for request payload validation."""

    def test_register_request_valid(self):
        from app.schemas.payloads import RegisterRequest
        req = RegisterRequest(name="John", email="john@example.com", password="password123")
        assert req.name == "John"
        assert req.email == "john@example.com"

    def test_register_request_password_too_short(self):
        from app.schemas.payloads import RegisterRequest
        with pytest.raises(Exception):
            RegisterRequest(name="John", email="john@example.com", password="12345")

    def test_register_request_empty_name(self):
        from app.schemas.payloads import RegisterRequest
        with pytest.raises(Exception):
            RegisterRequest(name="", email="john@example.com", password="pass123")

    def test_login_request_valid(self):
        from app.schemas.payloads import LoginRequest
        req = LoginRequest(email="user@test.com", password="password123")
        assert req.email == "user@test.com"

    def test_quote_create_valid(self):
        from app.schemas.payloads import QuoteCreate
        q = QuoteCreate(origin="NYC", destination="LAX", mode="air")
        assert q.mode == "air"
        assert q.weight is None

    def test_quote_create_invalid_mode(self):
        from app.schemas.payloads import QuoteCreate
        with pytest.raises(Exception):
            QuoteCreate(origin="NYC", destination="LAX", mode="teleport")

    def test_quote_create_weight_too_high(self):
        from app.schemas.payloads import QuoteCreate
        with pytest.raises(Exception):
            QuoteCreate(origin="NYC", destination="LAX", weight=200000)

    def test_shipment_create_valid(self):
        from app.schemas.payloads import ShipmentCreate
        s = ShipmentCreate(origin="Shanghai", destination="Rotterdam")
        assert s.mode == "sea"
        assert s.currency == "USD"

    def test_invoice_create_valid(self):
        from app.schemas.payloads import InvoiceCreate
        inv = InvoiceCreate(customer_id="00000000-0000-0000-0000-000000000000", amount=1500.0, tax=150.0)
        assert inv.amount == 1500.0
        assert inv.currency == "USD"
        assert inv.customer_id == "00000000-0000-0000-0000-000000000000"

    def test_expense_create_must_be_positive(self):
        from app.schemas.payloads import ExpenseCreate
        with pytest.raises(Exception):
            ExpenseCreate(category="Fuel", amount=0)

    def test_container_create_defaults(self):
        from app.schemas.payloads import ContainerCreate
        c = ContainerCreate(container_no="CNT-001", type="dry")
        assert c.status == "Available"

    def test_route_create_defaults(self):
        from app.schemas.payloads import RouteCreate
        r = RouteCreate(route_code="RT-001", origin="A", destination="B")
        assert r.status == "Active"

    def test_vehicle_create_defaults(self):
        from app.schemas.payloads import VehicleCreate
        v = VehicleCreate(vehicle_no="VH-001", type="truck")
        assert v.status == "Available"

    def test_delivery_create_defaults(self):
        from app.schemas.payloads import DeliveryCreate
        d = DeliveryCreate()
        assert d.status == "Pending"

    def test_ticket_create_defaults(self):
        from app.schemas.payloads import TicketCreate
        t = TicketCreate(subject="Help needed")
        assert t.priority == "medium"

    def test_customs_create_defaults(self):
        from app.schemas.payloads import CustomsCreate
        c = CustomsCreate()
        assert c.direction == "import"
        assert c.currency == "USD"

    def test_insurance_create_defaults(self):
        from app.schemas.payloads import InsuranceCreate
        ins = InsuranceCreate()
        assert ins.currency == "USD"

    def test_reset_password_min_length(self):
        from app.schemas.payloads import ResetPasswordRequest
        with pytest.raises(Exception):
            ResetPasswordRequest(token="abc", new_password="12345")

    def test_change_password_min_length(self):
        from app.schemas.payloads import ChangePasswordRequest
        with pytest.raises(Exception):
            ChangePasswordRequest(current_password="old123456", new_password="12345")

    def test_forgot_password_valid_email(self):
        from app.schemas.payloads import ForgotPasswordRequest
        req = ForgotPasswordRequest(email="user@example.com")
        assert req.email == "user@example.com"


# =============================================================================
# INTEGRATION TESTS -- FastAPI Application
# =============================================================================

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_integration.db"


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def client(test_engine):
    """Create test client with overridden DB dependency."""
    from app.main import app

    async def override_get_db():
        session_factory = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def registered_user(client):
    """Register a test user and return credentials + token."""
    payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "testpass123",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    return {
        "email": payload["email"],
        "password": payload["password"],
        "token": data["access_token"],
        "user": data["user"],
    }


class TestHealthEndpoint:
    """Integration tests for the root and health endpoints."""

    @pytest.mark.anyio
    async def test_root_endpoint(self, client):
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "NexaCargo API"
        assert "docs" in data

    @pytest.mark.anyio
    async def test_health_endpoint(self, client):
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestAuthIntegration:
    """Integration tests for the auth API routes."""

    @pytest.mark.anyio
    async def test_register_success(self, client):
        payload = {
            "name": "New User",
            "email": "newuser_integration@example.com",
            "password": "newpass123",
        }
        response = await client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "newuser_integration@example.com"
        assert data["user"]["name"] == "New User"
        assert "password_hash" not in data["user"]

    @pytest.mark.anyio
    async def test_register_duplicate_email(self, client, registered_user):
        payload = {
            "name": "Another User",
            "email": registered_user["email"],
            "password": "otherpass123",
        }
        response = await client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 409

    @pytest.mark.anyio
    async def test_register_invalid_email(self, client):
        payload = {
            "name": "Bad Email",
            "email": "not-an-email",
            "password": "pass12345",
        }
        response = await client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 422

    @pytest.mark.anyio
    async def test_register_short_password(self, client):
        payload = {
            "name": "Short Pass",
            "email": "short@example.com",
            "password": "123",
        }
        response = await client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 422

    @pytest.mark.anyio
    async def test_login_success(self, client, registered_user):
        payload = {
            "email": registered_user["email"],
            "password": registered_user["password"],
        }
        response = await client.post("/api/v1/auth/login", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == registered_user["email"]

    @pytest.mark.anyio
    async def test_login_wrong_password(self, client, registered_user):
        payload = {
            "email": registered_user["email"],
            "password": "wrongpassword",
        }
        response = await client.post("/api/v1/auth/login", json=payload)
        assert response.status_code == 401

    @pytest.mark.anyio
    async def test_login_nonexistent_user(self, client):
        payload = {
            "email": "nonexistent@example.com",
            "password": "anypassword",
        }
        response = await client.post("/api/v1/auth/login", json=payload)
        assert response.status_code == 401

    @pytest.mark.anyio
    async def test_get_me_authenticated(self, client, registered_user):
        headers = {"Authorization": f"Bearer {registered_user['token']}"}
        response = await client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == registered_user["email"]

    @pytest.mark.anyio
    async def test_get_me_no_token(self, client):
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    @pytest.mark.anyio
    async def test_get_me_invalid_token(self, client):
        headers = {"Authorization": "Bearer invalid-token-here"}
        response = await client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    @pytest.mark.anyio
    async def test_refresh_token(self, client, registered_user):
        headers = {"Authorization": f"Bearer {registered_user['token']}"}
        response = await client.post("/api/v1/auth/refresh-token", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    @pytest.mark.anyio
    async def test_logout(self, client, registered_user):
        headers = {"Authorization": f"Bearer {registered_user['token']}"}
        response = await client.post("/api/v1/auth/logout", headers=headers)
        assert response.status_code == 200
        assert response.json()["message"] == "Logged out"

    @pytest.mark.anyio
    async def test_forgot_password_existing_user(self, client, registered_user):
        payload = {"email": registered_user["email"]}
        response = await client.post("/api/v1/auth/forgot-password", json=payload)
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_forgot_password_nonexistent_user(self, client):
        payload = {"email": "nobody@example.com"}
        response = await client.post("/api/v1/auth/forgot-password", json=payload)
        assert response.status_code == 200
        # Should not reveal whether email exists (security best practice)

    @pytest.mark.anyio
    async def test_update_profile(self, client, registered_user):
        headers = {"Authorization": f"Bearer {registered_user['token']}"}
        payload = {"name": "Updated Name", "company": "Test Corp"}
        response = await client.patch("/api/v1/auth/me", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["company"] == "Test Corp"


class TestFullUserFlow:
    """Integration tests for complete user workflows."""

    @pytest.mark.anyio
    async def test_register_login_access_protected_route(self, client):
        """Full flow: register -> login -> access protected resource."""
        # Register
        reg_payload = {
            "name": "Flow User",
            "email": "flow_integration@example.com",
            "password": "flowpass123",
        }
        reg_response = await client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_response.status_code == 201
        reg_token = reg_response.json()["access_token"]

        # Login
        login_payload = {
            "email": reg_payload["email"],
            "password": reg_payload["password"],
        }
        login_response = await client.post("/api/v1/auth/login", json=login_payload)
        assert login_response.status_code == 200
        new_token = login_response.json()["access_token"]

        # Verify both tokens work
        headers = {"Authorization": f"Bearer {new_token}"}
        me_response = await client.get("/api/v1/auth/me", headers=headers)
        assert me_response.status_code == 200
        assert me_response.json()["email"] == "flow_integration@example.com"

        # Also verify register token works
        reg_headers = {"Authorization": f"Bearer {reg_token}"}
        reg_me_response = await client.get("/api/v1/auth/me", headers=reg_headers)
        assert reg_me_response.status_code == 200

    @pytest.mark.anyio
    async def test_reset_password_flow(self, client, registered_user):
        """Full flow: forgot password -> reset password -> login with new password."""
        # Create reset token directly (simulating email link)
        reset_token = create_password_reset_token(registered_user["user"]["id"])

        # Reset password
        reset_response = await client.post(
            "/api/v1/auth/reset-password",
            json={"token": reset_token, "new_password": "brandnewpass123"},
        )
        assert reset_response.status_code == 200

        # Login with new password
        login_response = await client.post(
            "/api/v1/auth/login",
            json={"email": registered_user["email"], "password": "brandnewpass123"},
        )
        assert login_response.status_code == 200

    @pytest.mark.anyio
    async def test_invalid_reset_token_rejected(self, client):
        response = await client.post(
            "/api/v1/auth/reset-password",
            json={"token": "invalid-token", "new_password": "newpass123"},
        )
        assert response.status_code in (400, 422)


class TestQuotesAPI:
    """Integration tests for the quotes API."""

    @pytest.mark.anyio
    async def test_create_quote(self, client, registered_user):
        headers = {"Authorization": f"Bearer {registered_user['token']}"}
        payload = {
            "origin": "New York",
            "destination": "London",
            "mode": "air",
            "weight": 500.0,
            "cargo_type": "Electronics",
        }
        response = await client.post("/api/v1/quotes", json=payload, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["origin"] == "New York"
        assert data["destination"] == "London"
        assert data["mode"] == "air"

    @pytest.mark.anyio
    async def test_list_quotes(self, client, registered_user):
        headers = {"Authorization": f"Bearer {registered_user['token']}"}
        response = await client.get("/api/v1/quotes", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.anyio
    async def test_create_quote_invalid_mode(self, client, registered_user):
        headers = {"Authorization": f"Bearer {registered_user['token']}"}
        payload = {
            "origin": "NYC",
            "destination": "LAX",
            "mode": "teleport",
        }
        response = await client.post("/api/v1/quotes", json=payload, headers=headers)
        assert response.status_code == 422


class TestValidationIntegration:
    """Integration tests for request validation at the API boundary."""

    @pytest.mark.anyio
    async def test_empty_body_returns_422(self, client):
        response = await client.post("/api/v1/auth/login", json={})
        assert response.status_code == 422

    @pytest.mark.anyio
    async def test_malformed_json_handled(self, client):
        response = await client.post(
            "/api/v1/auth/register",
            content="not json",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code in (400, 422)

    @pytest.mark.anyio
    async def test_validation_error_format(self, client):
        response = await client.post("/api/v1/auth/login", json={
            "email": "invalid",
            "password": "",
        })
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data


class TestSettings:
    """Unit tests for application settings."""

    def test_default_app_name(self):
        assert settings.APP_NAME == "NexaCargo API"

    def test_default_version(self):
        assert settings.VERSION == "1.0.0"

    def test_default_jwt_algorithm(self):
        assert settings.JWT_ALGORITHM == "HS256"

    def test_default_jwt_issuer(self):
        assert settings.JWT_ISSUER == "nexacargo-api"

    def test_cors_origin_list_empty_wildcard(self):
        with patch.object(settings, "CORS_ORIGINS", "*"):
            assert settings.cors_origin_list == []

    def test_cors_origin_list_parses_comma_separated(self):
        with patch.object(settings, "CORS_ORIGINS", "https://a.com, https://b.com"):
            result = settings.cors_origin_list
            assert "https://a.com" in result
            assert "https://b.com" in result
