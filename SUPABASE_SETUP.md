# Supabase Integration Setup for InscribeMate

This guide will help you set up Supabase for your InscribeMate project.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your InscribeMate project cloned locally

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `inscribemate` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-migration.sql` from this project
3. Paste it into the SQL Editor
4. Click "Run" to execute the migration
5. Verify that all tables were created by going to **Table Editor**

## Step 4: Configure Environment Variables

1. Copy `env.example` to `.env` in your project root:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Database Configuration (for Drizzle)
   DATABASE_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres

   # Application Configuration
   NODE_ENV=development
   PORT=5000
   ```

3. Create a `.env.local` file in the `client` directory for frontend environment variables:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the console for any Supabase connection errors
3. Test the API endpoints to ensure they're working with Supabase

## Step 6: Configure Authentication (Optional)

If you want to use Supabase Auth:

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your site URL (e.g., `http://localhost:5000` for development)
3. Set up email templates if needed
4. Configure OAuth providers if desired

## Step 7: Set Up Row Level Security (RLS)

The migration script includes basic RLS policies, but you may want to customize them:

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Review and modify the policies as needed for your use case
3. Test the policies to ensure they work correctly

## Troubleshooting

### Common Issues

1. **Connection refused**: Check that your environment variables are correct
2. **Permission denied**: Verify that your RLS policies are set up correctly
3. **Table doesn't exist**: Make sure you ran the migration script
4. **CORS errors**: Add your domain to the allowed origins in Supabase settings

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Join the [Supabase Discord](https://discord.supabase.com)
- Check the project's GitHub issues

## Next Steps

Once Supabase is set up:

1. Update your frontend components to use the Supabase client
2. Implement real-time subscriptions for live updates
3. Set up file storage for user uploads
4. Configure email templates for notifications
5. Set up monitoring and analytics

## Security Notes

- Never commit your `.env` files to version control
- Use the `anon` key for client-side operations
- Use the `service_role` key only for server-side operations
- Regularly rotate your API keys
- Review and update RLS policies regularly
