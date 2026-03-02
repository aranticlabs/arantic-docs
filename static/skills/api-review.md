Review the API route handlers, controllers, or endpoint definitions in $ARGUMENTS.

If no path is given, find and review all route handler files in the project.

Check each endpoint for:

**Input validation**
- All user-supplied inputs validated (body, query params, path params, headers)
- No raw values passed to database queries, shell commands, or templates
- Missing content-type checks or request body size limits

**HTTP semantics**
- Correct HTTP method for the operation
- Correct and consistent status codes (201 for creation, 4xx for client errors, 5xx for server errors)
- No 200 responses with `{ success: false }` bodies

**Error handling**
- All promise rejections and exceptions caught
- Error responses do not leak stack traces, SQL errors, or internal paths
- Consistent error response shape across endpoints

**Auth & authorization**
- Authentication middleware present on all protected routes
- Authorization checks verify the user owns or can access the resource
- Sensitive operations (delete, admin actions) have privilege checks

**Design consistency**
- Consistent naming convention (camelCase vs snake_case)
- Pagination on collection endpoints that could return large results
- Rate limiting on auth-related or expensive endpoints

Report grouped by category. For each issue: file, route, line, description, and recommended fix. End with an overall API quality summary.
