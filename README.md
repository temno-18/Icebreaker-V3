# Icebreaker V3

Icebreaker is a GitHub Pages game hub with Supabase-backed access, bans, and browser activity tracking.

## Included projects
- 2048 Classic (`projects/1`)
- 1v1.space (`projects/1v1space`)
- 2048 (`projects/2048`)
- DogeMiner (`projects/DogeMiner`)
- HexGL (`projects/HexGl`)

The game library is generated from the projects actually bundled in this repository, so it no longer points at 140+ missing folders.

## Active device list
Run `supabase_active_users.sql` in the Supabase SQL editor. The site creates a browser-scoped `icebreaker_device_id` and sends a heartbeat about every 30 seconds. The admin page shows IDs seen within the last 2 minutes as ACTIVE.

This is not a hardware fingerprint. It is a random ID stored in the browser's localStorage and can change if local storage is cleared.

## Web/proxy tools
GitHub Pages is static and cannot run a server-side proxy. `proxy.html` is a gateway UI that can point to a proxy endpoint you own or are authorized to use. No third-party proxy server is bundled.


## Admin + Realtime Troll Center setup
1. In Supabase Dashboard, open Authentication -> Users -> Add user and create each admin login with email/password.
2. Run `supabase_active_users.sql` in SQL Editor.
3. At the bottom of that SQL file, add your admin emails to `icebreaker_admins`, for example:
   `insert into public.icebreaker_admins(email) values ('oscarisawesome@gmail.com'), ('oscarxxu@gmail.com') on conflict (email) do nothing;`
4. Deploy the project.
5. Open `/admin.html`, sign in with one of the Supabase admin accounts, and use Troll Center.

The Troll Center sends realtime announcements and synthetic sound effects to connected Icebreaker pages. Remote audio can only play after a visitor has interacted with the page because of normal browser autoplay restrictions.
