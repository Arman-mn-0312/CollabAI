# CollabAI - Database Schema

## 1. Database

Database technology:

Supabase PostgreSQL

The database is shared by both developers.

The schema should be treated as a shared contract.

---

# 2. Core Tables

Initial tables:

1. profiles
2. groups
3. group_members
4. member_messages
5. ai_sections
6. group_ai_messages
7. personal_ai_conversations
8. personal_ai_messages

---

# 3. profiles

Stores additional user information.

Suggested fields:

```text
id
full_name
username
avatar_url
created_at
updated_at