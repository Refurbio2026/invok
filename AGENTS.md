# Architecture
- School pages live under the existing authenticated layout and load school-scoped query options; authorization derives the school from the signed-in profile, never request input.
- School operations use the authenticated database client and RLS; teacher accounts remain centrally provisioned, while schools assign existing teachers to classes.
- Teachers access only classes assigned to their authenticated user ID; class assignments and student management use ownership-scoped RLS, not elevated clients.
- Student access retains code/PIN verification on every server operation; test availability, attempts, question membership and result visibility are enforced server-side using shared pure rules.