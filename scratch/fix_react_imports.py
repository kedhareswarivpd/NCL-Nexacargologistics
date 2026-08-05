"""Add 'import React' to files that reference React.FormEvent but don't import React."""
import os
import re

base = r"c:\Users\DELL\Desktop\NCL-Nexacargologistics\frontend\src"
fixed = 0

for root, dirs, files in os.walk(base):
    for fname in files:
        if not fname.endswith((".tsx", ".ts")):
            continue
        fp = os.path.join(root, fname)
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read()

        # Check if file uses React.FormEvent but doesn't import React
        if "React.FormEvent" not in content and "React." not in content:
            continue
        if "import React" in content:
            continue

        lines = content.split("\n")
        insert_at = 0

        # Find where to insert - after 'use client' directive if present
        for i, line in enumerate(lines):
            stripped = line.strip().strip(";").strip()
            if stripped in ("'use client'", '"use client"'):
                insert_at = i + 1
                break

        # Insert import React
        lines.insert(insert_at, 'import React from "react";')
        content = "\n".join(lines)

        with open(fp, "w", encoding="utf-8", newline="") as f:
            f.write(content)
        rel = os.path.relpath(fp, r"c:\Users\DELL\Desktop\NCL-Nexacargologistics")
        print(f"Added React import: {rel}")
        fixed += 1

print(f"\nFixed {fixed} files")
