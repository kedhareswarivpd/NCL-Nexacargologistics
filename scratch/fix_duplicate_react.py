"""Remove duplicate React imports - handles both 'import React' and 'import * as React'."""
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

        lines = content.split("\n")
        
        # Check for duplicate React imports
        react_default_imports = []  # import React from "react"
        react_star_imports = []     # import * as React from "react"
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            if re.match(r'^import React from ["\']react["\'];?\s*$', stripped):
                react_default_imports.append(i)
            elif re.match(r'^import \* as React from ["\']react["\'];?\s*$', stripped):
                react_star_imports.append(i)
        
        total_react = len(react_default_imports) + len(react_star_imports)
        if total_react <= 1:
            continue
        
        # Remove duplicates - keep the first one, remove subsequent ones
        # If we have both styles, prefer `import * as React` and remove `import React`
        lines_to_remove = set()
        
        if react_star_imports and react_default_imports:
            # Keep the star import, remove default imports
            lines_to_remove.update(react_default_imports)
        elif len(react_default_imports) > 1:
            # Keep first, remove rest
            lines_to_remove.update(react_default_imports[1:])
        elif len(react_star_imports) > 1:
            # Keep first, remove rest
            lines_to_remove.update(react_star_imports[1:])
        
        if not lines_to_remove:
            continue
        
        new_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]
        content = "\n".join(new_lines)
        
        with open(fp, "w", encoding="utf-8", newline="") as f:
            f.write(content)
        rel = os.path.relpath(fp, r"c:\Users\DELL\Desktop\NCL-Nexacargologistics")
        print(f"Fixed duplicate React import: {rel} (removed {len(lines_to_remove)} lines)")
        fixed += 1

print(f"\nFixed {fixed} files")
