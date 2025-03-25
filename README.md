# Full Throttle Revenue Presentation

An interactive, F1 racing-themed presentation on Revenue Operations (RevOps) and Automation designed for undergraduate business students at Manning School of Business, University of Massachusetts Lowell.

## Project Overview

- **Title:** "Full Throttle Revenue: How RevOps & Automation Drive Success"
- **Duration:** 40 minutes
- **Audience:** Undergraduate business students
- **Design:** Dynamic, clean, modern design with racing-inspired visuals
- **Deployment:** Vercel

## Key Features

- Dynamic slide transitions with racing-inspired visuals
- Interactive polling system integrated with Supabase
- Animated timeline for evolution of sales tech
- Responsive design for multiple devices
- Linear navigation supporting speech flow

## Setup and Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/DrewRevelate/RevOps_Presentation.git
   cd RevOps_Presentation
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content (replace with your actual Supabase credentials):
   ```
   SUPABASE_URL=https://zdnmzumoccwagafxtnld.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbm16dW1vY2N3YWdhZnh0bmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDYyNTEsImV4cCI6MjA1ODAyMjI1MX0.kHCrQ0HG08Myk4JFzxgIyAvbeAcHtrc8YwE08rhHxQ8
   NODE_ENV=development
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deploying to Vercel

1. Create a Vercel account if you don't have one: [https://vercel.com/signup](https://vercel.com/signup)

2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

3. Login to Vercel:
   ```
   vercel login
   ```

4. Deploy to Vercel:
   ```
   vercel
   ```

5. For production deployment:
   ```
   vercel --prod
   ```

## Supabase Setup

1. Create a Supabase account: [https://supabase.com/](https://supabase.com/)
2. Create a new project
3. Set up the following tables:
   - `presentation_logs`: Tracks slide views
   - `poll_responses`: Stores poll responses
   - `presentation_feedback`: Collects presentation feedback

## Project Structure

- `/public` - Contains all HTML slides
- `/images` - Image assets
- `/db` - Database configuration and seeds
- `/styles.css` - Main stylesheet
- `/server.js` - Express server configuration
- `/vercel.json` - Vercel deployment configuration

## Polling Integration

The presentation includes interactive polls that allow audience engagement. Results are displayed in real-time as participants respond.

## Customization

To modify the presentation content:

1. Edit slide HTML files in the `/public` directory
2. Update styles in `styles.css`
3. Replace images in the `/images` directory
4. Modify slide transitions and animations in the respective HTML files

## License

MIT License

## Contact

Drew Lambert - drew@revelateops.com