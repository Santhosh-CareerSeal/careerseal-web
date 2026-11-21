# GRID (careerseal-web) — Setup & Workflow

Everything you need to run this project on any computer, and how day-to-day
development works. **GitHub is the source of truth** — your laptop just holds a
copy that you sync with `git pull` / `git push`.

---

## What this project is

A monorepo with two apps:

| Folder      | Stack                                            | Deploys to |
|-------------|--------------------------------------------------|------------|
| `frontend/` | React + Vite + Tailwind                          | Vercel     |
| `backend/`  | Node + Express + Prisma + Supabase Postgres      | Render     |

Pushing to the `main` branch auto-deploys both. Live site:
https://www.thegridcard.com

---

## Set up on a new computer (first time)

1. **Install the tools** (one-time downloads):
   - [Git](https://git-scm.com/)
   - [Node.js](https://nodejs.org/) (LTS)
   - [VS Code](https://code.visualstudio.com/)

2. **Get the code from GitHub:**
   ```bash
   git clone https://github.com/Santhosh-CareerSeal/careerseal-web
   cd careerseal-web
   ```

3. **Install dependencies in BOTH apps** (it's a monorepo — there is no
   `package.json` at the root):
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Add your secrets.** The `.env` files are intentionally NOT in Git (they
   hold passwords and API keys). Create them from the templates and fill in the
   real values — copy them from your old laptop, or from the Render/Vercel
   dashboards:
   ```bash
   # from the repo root
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # then edit both files and paste in the real values
   ```

5. **Run it locally:**
   ```bash
   cd backend && npm run dev     # starts the API (default http://localhost:5000)
   cd ../frontend && npm run dev # starts the site (default http://localhost:5173)
   ```

Open the `careerseal-web` folder in VS Code and you have the full project.

---

## Day-to-day workflow

```bash
git pull origin main        # get the latest before you start
# ...edit code in VS Code...
git add -A
git commit -m "what changed"
git push origin main        # publishes + auto-deploys to Vercel/Render
```

**Always `git pull` first** so your laptop has the newest code. Your local copy
is only as current as your last pull — GitHub always has the latest.

---

## Adding another developer

1. On GitHub: repo **Settings → Collaborators → Add people** (invite their
   GitHub account).
2. They run the same "Set up on a new computer" steps above on their machine.
3. They edit, commit, and `git push` — the same way you do.

For real teamwork, have them push a **branch** and open a Pull Request instead
of pushing straight to `main`, so changes get reviewed before going live.

---

## Database / schema changes

The database schema lives in `backend/prisma/schema.prisma`. After changing it,
apply the change to Supabase with:
```bash
cd backend
# set the Mumbai connection strings for this command only (single quotes!):
export DATABASE_URL='<pooled connection string from Supabase → Connect → Prisma>'
export DIRECT_URL='<direct connection string from Supabase → Connect → Prisma>'
npx prisma db push
```
Get both strings from **Supabase → your project → Connect → ORMs → Prisma**, and
replace only `[YOUR-PASSWORD]`. Run this whenever you add/change a table or
column, otherwise the live app will error on the missing column.

---

## If a laptop dies

Nothing is lost — the code is on GitHub. On the replacement machine, do the
"Set up on a new computer" steps, copy your `.env` files back, and you're
exactly where you left off. The **only** thing not stored in Git is the `.env`
secrets, so keep a safe backup of those (e.g. a password manager).
