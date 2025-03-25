# Full Throttle Revenue Presentation

An interactive, F1 racing-themed presentation on Revenue Operations (RevOps) and Automation designed for undergraduate business students at Manning School of Business, University of Massachusetts Lowell.

![Full Throttle Logo](images/logo.png)

## Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/DrewRevelate/RevOps_Presentation.git
cd RevOps_Presentation

# Install dependencies
npm install

# Start the server
npm run dev

# Access the presentation
open http://localhost:3000
```

### Deployment

For easy deployment to Vercel:

```bash
./deploy.sh
```

### Troubleshooting

For automatic diagnosis and fixes:

```bash
./fix-issues.sh
```

## Project Overview

- **Title:** "Full Throttle Revenue: How RevOps & Automation Drive Success"
- **Duration:** 40 minutes
- **Audience:** Undergraduate business students
- **Design:** Dynamic, clean, modern design with racing-inspired visuals
- **Deployment:** Vercel (fullthrottle.revelateops.com)

## Key Features

- 🏎️ **Racing-Themed Design:** F1-inspired visuals and transitions
- 📊 **Interactive Polling:** Real-time audience engagement with Supabase
- ⏱️ **Animated Timeline:** Visual evolution of sales technology
- 📱 **Responsive Design:** Optimized for all devices
- 🔄 **Linear Navigation:** Intuitive flow supporting the presentation

## Presentation Structure

1. **Introduction:** Overview and agenda
2. **RevOps Fundamentals:** Core concepts and benefits
3. **Sales Automation Technologies:** Evolution and key tools
4. **Business Rules & Validation Logic:** Implementation examples
5. **Attribution Models:** Understanding different approaches
6. **Case Studies:** Real-world success stories
7. **Conclusion:** Key takeaways and Q&A

## Technical Implementation

### Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js with Express
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Version Control:** GitHub

### Project Structure

```
/
├── public/               # Presentation slides (HTML)
├── images/               # Image assets
├── db/                   # Database configuration
│   └── supabase/         # Supabase integration
├── styles.css            # Main stylesheet
├── server.js             # Express server
├── index.html            # Main entry point
├── deploy.sh             # Deployment script
├── fix-issues.sh         # Troubleshooting script
└── vercel.json           # Vercel deployment config
```

## Documentation

Comprehensive documentation is available in these files:

- [Deployment Guide](DEPLOY.md) - Step-by-step instructions for deployment
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Solutions for common issues

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/DrewRevelate/RevOps_Presentation.git
   cd RevOps_Presentation
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory with:

```
SUPABASE_URL=https://zdnmzumoccwagafxtnld.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbm16dW1vY2N3YWdhZnh0bmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDYyNTEsImV4cCI6MjA1ODAyMjI1MX0.kHCrQ0HG08Myk4JFzxgIyAvbeAcHtrc8YwE08rhHxQ8
NODE_ENV=development
```

## Customization

### Slides

Each slide is an independent HTML file in the `public` directory:

- `01-introduction.html`
- `02-revops-fundamentals.html`
- `03-sales-automation.html`
- ...etc.

To modify content, edit these files directly.

### Styling

The main stylesheet is `styles.css` in the root directory. Each slide also contains slide-specific styles.

### Images

Add or replace images in the `images` directory.

## Polling System

The presentation includes interactive polls that store results in Supabase:

- Poll results are displayed in real-time
- All responses are recorded for later analysis
- Fallback mechanisms ensure polls work even with connectivity issues

## License

MIT License

## Contact

Drew Lambert - drew@revelateops.com
