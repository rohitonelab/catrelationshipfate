---
description: Build, verify typechecking, and push current changes to github repositories.
---
// turbo-all

1. Run the filter typecheck command to verify the app compiles:
   `npx pnpm --filter @workspace/cat-court run typecheck`
2. Run the main repository build to compile API server and assets:
   `npx pnpm build`
3. Add the changes to git:
   `git add .`
4. Commit the changes:
   `git commit -m "Fix dice animation getting stuck on verdict page"`
5. Push to origin:
   `git push origin main`
