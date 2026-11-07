# Architecture
- School pages live under the existing authenticated layout and load school-scoped query options; authorization derives the school from the signed-in profile, never request input.
- School operations use the authenticated database client and RLS; teacher accounts remain centrally provisioned, while schools assign existing teachers to classes.