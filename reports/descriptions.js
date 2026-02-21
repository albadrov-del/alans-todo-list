'use strict';

/**
 * Plain-English descriptions for every test.
 * Key format:  "Innermost describe block > test name"
 */
const DESCRIPTIONS = {

  // ── Jest: POST /api/auth/register ─────────────────────────────────────────

  'POST /api/auth/register > returns 201 and a success message for valid data':
    'A new account is successfully created when all required details — username, email, and password — are provided correctly.',

  'POST /api/auth/register > returns 400 when username is missing':
    'The system correctly refuses to create an account when no username is provided.',

  'POST /api/auth/register > returns 400 when email is missing':
    'The system correctly refuses to create an account when no email address is provided.',

  'POST /api/auth/register > returns 400 when password is missing':
    'The system correctly refuses to create an account when no password is provided.',

  'POST /api/auth/register > returns 400 for an invalid email format':
    'The system correctly refuses to accept an email address that is not in a valid format (for example, "not-an-email").',

  'POST /api/auth/register > returns 400 when password is shorter than 8 characters':
    'The system correctly refuses passwords that are too short — at least 8 characters are required for security.',

  'POST /api/auth/register > returns 400 when username is shorter than 2 characters':
    'The system correctly refuses usernames that are too short — at least 2 characters are required.',

  'POST /api/auth/register > returns 409 and mentions "email" when email is already registered':
    'If someone tries to register with an email address that already has an account, the system clearly tells them the email is already in use.',

  'POST /api/auth/register > returns 409 and mentions "username" when username is already taken':
    'If someone tries to register with a username that is already taken, the system clearly tells them the username is unavailable.',

  // ── Jest: POST /api/auth/login ────────────────────────────────────────────

  'POST /api/auth/login > returns 200 and sets a token cookie on valid credentials':
    'Signing in with the correct email and password works as expected, and a secure login session is established.',

  'POST /api/auth/login > returns 401 for a wrong password':
    'The system correctly refuses to sign in someone who enters the wrong password.',

  'POST /api/auth/login > returns 401 for an unknown email':
    'The system correctly refuses to sign in someone whose email address is not registered.',

  'POST /api/auth/login > uses the same error message for wrong password and unknown email (no enumeration)':
    'For security, the system gives the exact same error message whether the email does not exist or the password is wrong — this prevents attackers from discovering which email addresses are registered.',

  'POST /api/auth/login > returns 400 when email is missing':
    'The system correctly refuses a sign-in attempt when no email address is provided.',

  'POST /api/auth/login > returns 400 when password is missing':
    'The system correctly refuses a sign-in attempt when no password is provided.',

  // ── Jest: POST /api/auth/logout ───────────────────────────────────────────

  'POST /api/auth/logout > returns 200 and clears the token cookie':
    'Signing out works correctly — the secure login session is removed.',

  // ── Jest: GET /api/auth/me ────────────────────────────────────────────────

  'GET /api/auth/me > returns 401 when not authenticated':
    'A visitor who is not signed in cannot access any account information.',

  'GET /api/auth/me > returns user info when authenticated':
    'A signed-in user can retrieve their own account details (username and email). Importantly, their password is never sent back — it stays private at all times.',

  // ── Jest: GET /api/panels ─────────────────────────────────────────────────

  'GET /api/panels > returns 401 when not authenticated':
    'A visitor who is not signed in cannot view any to-do lists.',

  'GET /api/panels > returns an empty array for a brand-new user':
    'A newly registered user starts with no to-do lists — a clean slate.',

  "GET /api/panels > returns only the authenticated user's own panels":
    "Each user can only see their own to-do lists. Other users' lists are completely hidden from them.",

  'GET /api/panels > returns panels ordered by panel_order ascending':
    'To-do lists are displayed in the order they were created — the oldest list appears first.',

  // ── Jest: POST /api/panels ────────────────────────────────────────────────

  'POST /api/panels > returns 401 when not authenticated':
    'A visitor who is not signed in cannot create a new to-do list.',

  'POST /api/panels > returns 201 with the new panel data':
    'Creating a new to-do list works correctly and the details of the newly created list are returned.',

  'POST /api/panels > increments panel_order for each new panel':
    'Each new to-do list is placed after the previous ones, so lists stay in the correct order.',

  'POST /api/panels > uses a default name when panel_name is omitted':
    'If no name is provided when creating a list, the system automatically names it "To Do List".',

  // ── Jest: PUT /api/panels/:id ─────────────────────────────────────────────

  'PUT /api/panels/:id > returns 401 when not authenticated':
    'A visitor who is not signed in cannot edit a to-do list.',

  'PUT /api/panels/:id > updates content and returns the updated panel':
    'Saving the content of a to-do list works correctly, and the saved version is returned for confirmation.',

  'PUT /api/panels/:id > updates panel_name':
    'Renaming a to-do list works correctly.',

  'PUT /api/panels/:id > returns 404 for a non-existent panel':
    'Trying to save changes to a list that does not exist is handled gracefully — no error is thrown.',

  "PUT /api/panels/:id > returns 404 when user B tries to update user A's panel":
    "One user cannot edit another user's to-do list. Each list is private — another user attempting to access it receives a 'not found' response.",

  // ── Jest: DELETE /api/panels/:id ──────────────────────────────────────────

  'DELETE /api/panels/:id > returns 401 when not authenticated':
    'A visitor who is not signed in cannot delete a to-do list.',

  'DELETE /api/panels/:id > deletes the panel and returns 204':
    'Deleting a to-do list works correctly — it is permanently removed.',

  'DELETE /api/panels/:id > returns 404 for a non-existent panel':
    'Trying to delete a list that does not exist is handled gracefully.',

  "DELETE /api/panels/:id > returns 404 when user B tries to delete user A's panel":
    "One user cannot delete another user's to-do list. The list is protected — the other user gets a 'not found' response, and the list remains intact for its owner.",

  // ── Playwright: Registration ───────────────────────────────────────────────

  'Registration > unauthenticated visit to / redirects to /login':
    'A visitor who is not signed in is automatically taken to the login page when they try to open the app.',

  'Registration > register page is accessible at /register':
    'The account registration page loads correctly and displays the "Create account" heading.',

  'Registration > successful registration redirects to /login with no errors':
    'Filling in all registration details correctly and submitting the form creates a new account and takes the user to the sign-in page.',

  'Registration > shows an error when email is already registered':
    'If someone tries to register with an email address that already belongs to an account, a clear error message is shown on the page.',

  'Registration > shows a client-side error when passwords do not match':
    'If the password and the "confirm password" fields do not match, an error message appears immediately — the form is not submitted.',

  // ── Playwright: Login ─────────────────────────────────────────────────────

  'Login > login page is accessible at /login':
    'The sign-in page loads correctly and displays the "Sign in" heading.',

  'Login > successful login redirects to the main app':
    'Entering the correct email and password signs the user in and takes them straight to their to-do lists.',

  'Login > shows a generic error for wrong credentials':
    'Entering an incorrect password shows a clear "Invalid email or password" message.',

  'Login > register page has a link to /login':
    'The registration page has a working link that takes users to the sign-in page.',

  'Login > login page has a link to /register':
    'The sign-in page has a working link that takes users to the registration page.',

  // ── Playwright: Sign out ──────────────────────────────────────────────────

  'Sign out > sign out button redirects to /login':
    'Clicking the "Sign out" button successfully ends the session and takes the user back to the sign-in page.',

  'Sign out > visiting / after sign-out redirects to /login':
    'After signing out, attempting to revisit the app automatically redirects back to the sign-in page — the private to-do lists cannot be accessed without signing in again.',

  // ── Playwright: Panel loading ─────────────────────────────────────────────

  'Panel loading > a first panel is auto-created for a new user':
    'When a brand-new user signs in for the first time, a default to-do list is automatically created and ready for them.',

  'Panel loading > first panel is expanded by default':
    'The first to-do list is automatically expanded when the user opens the app, so they can start adding items straight away.',

  // ── Playwright: Add new panel ─────────────────────────────────────────────

  'Add new panel > clicking "Add new list" creates a new panel':
    'Clicking the "Add new list" button successfully creates an additional to-do list on the page.',

  'Add new panel > new panel is expanded and focused':
    'A newly created to-do list is automatically opened and ready to use — no extra clicking required.',

  // ── Playwright: Save panel ────────────────────────────────────────────────

  'Save panel > save button shows "Saved ✓" feedback briefly':
    'After clicking Save, the button briefly shows "Saved ✓" to confirm that the changes have been recorded successfully.',

  'Save panel > content persists after page reload':
    'Content typed into a to-do list and saved is still there after refreshing the page — nothing is lost.',

  // ── Playwright: Cancel ────────────────────────────────────────────────────

  'Cancel > cancel collapses the panel':
    'Clicking the Cancel button closes the to-do list panel without saving any unsaved changes.',

  // ── Playwright: Delete panel ──────────────────────────────────────────────

  'Delete panel > delete button removes the panel from the page':
    'Clicking the Delete button and confirming the action successfully removes the to-do list from the page.',

  // ── Playwright: Accordion toggle ──────────────────────────────────────────

  'Accordion toggle > clicking the trigger collapses and re-expands a panel':
    'Clicking the to-do list header collapses it (hides the content), and clicking it again expands it back — the toggle works correctly in both directions.',
};

/**
 * Plain-English section headings.
 * Key: technical describe-block name  →  Value: friendly heading for the PDF
 */
const SECTION_HEADINGS = {
  // Jest — auth.test.js
  'POST /api/auth/register': 'Creating an Account',
  'POST /api/auth/login':    'Signing In',
  'POST /api/auth/logout':   'Signing Out',
  'GET /api/auth/me':        'Checking Who Is Logged In',

  // Jest — panels.test.js
  'GET /api/panels':        'Loading To-Do Lists',
  'POST /api/panels':       'Creating a New To-Do List',
  'PUT /api/panels/:id':    'Saving Changes to a To-Do List',
  'DELETE /api/panels/:id': 'Deleting a To-Do List',

  // Playwright — auth.spec.js
  'Registration': 'Account Registration',
  'Login':        'Signing In',
  'Sign out':     'Signing Out',

  // Playwright — panels.spec.js
  'Panel loading':    'Loading the To-Do App',
  'Add new panel':    'Adding a New List',
  'Save panel':       'Saving a List',
  'Cancel':           'Cancelling Without Saving',
  'Delete panel':     'Deleting a List',
  'Accordion toggle': 'Expanding and Collapsing Lists',
};

module.exports = { DESCRIPTIONS, SECTION_HEADINGS };
