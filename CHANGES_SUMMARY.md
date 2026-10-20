Task completed. Summary of changes:
- Updated ProductInventoryManager component to support image upload (with preview and removal), editing product details (including description), and inactivating/reactivating products.
- Updated Prisma schema: changed image column type to LONGTEXT.
- Added migration to alter image column to LONGTEXT.
- Updated admin product creation and update API routes to accept and store image as base64 data URL (with validation for JPEG, PNG, WebP up to 2MB).
- Added API route to serve stored product images with versioning based on updatedAt to avoid caching issues.
- Updated product listing and detail pages to use the new image serving route.
- Updated ProductInventoryManager spec to include description field and adjust tests accordingly.
- Fixed prettier issues in the test file.
- All tests, lint, typecheck, and build pass.
