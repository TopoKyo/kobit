# Security Specification for contactRequests and admins

## Data Invariants
1. **ContactRequest**:
   - `name`, `email`, `company`, `area`, `message` must be strings between 1 and 2000 characters.
   - `createdAt` must be exactly the server time during creation.
   - Public creation is allowed; read access is restricted to authenticated admins.

2. **Admin**:
   - Read access is restricted to authenticated admins.
   - Write access is restricted to existing admins to prevent self-promotion.

## The Dirty Dozen (Payloads)
1. **Unauthorized List**: Attempt to list `contactRequests` as an unauthenticated user. (Result: DENIED)
2. **Unauthorized Get**: Attempt to get a specific `contactRequestId` as an unauthenticated user. (Result: DENIED)
3. **Spoofed CreatedAt**: Attempt to create a `contactRequest` with a client-side timestamp. (Result: DENIED)
4. **Massive Payload**: Attempt to create a `contactRequest` with a 2MB message string. (Result: DENIED)
5. **Admin Self-Promotion**: Attempt to write a document to `/admins/{myUid}` as a non-admin. (Result: DENIED)
6. **Missing Required Field**: Attempt to create a `contactRequest` without an email. (Result: DENIED)
7. **Invalid ID**: Attempt to create a `contactRequest` with a weird ID containing special characters. (Result: DENIED)
8. **Shadow Update**: Attempt to update a `contactRequest` adding a field `processed: true` as a non-admin. (Result: DENIED)
9. **Admin List Leak**: Attempt to list `admins` collection as a logged-in user who isn't an admin. (Result: DENIED)
10. **Email Identity Spoofing**: Attempt to use `isAdmin()` based on a client-provided email claim without verification. (Result: DENIED - rules must check the doc)
11. **Update PII**: Attempt to update `company` name of an existing request as a guest. (Result: DENIED)
12. **Delete Request**: Attempt to delete a request as a guest. (Result: DENIED)

## Test Runner
(Tests would go in a dedicated test file if requested, but for now I'll proceed to drafting the rules.)
