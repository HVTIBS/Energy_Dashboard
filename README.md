# Energy Dashboard

A React-based energy analytics dashboard built around `Energy_app.js`.

## Overview

`Energy_app.js` renders an interactive energy monitoring portal with a polished UI and simulated telemetry data. It includes:

- 3-phase consumption, voltage, and power factor trends
- cost and billing visualization with day/night pricing
- system uptime tracking and availability analytics
- fault monitoring and alert configuration
- widget customization and dynamic dashboard layout
- real-time visualization components using Recharts

## Key Features

- **Dynamic Telemetry Simulation**: Generates mock energy, voltage, current, and power factor data across time scales.
- **Interactive Charts**: Includes line, bar, pie, and scatter charts for energy analytics.
- **Custom Widget Management**: Add or remove dashboard widgets such as distribution pie charts, scatter plots, and alerts.
- **Alert Configuration**: Toggle monitored fault rules and adjust thresholds for PF, voltage sag, and overload detection.
- **Navigation Views**: Switch between dashboard, uptime view, consumption filter view, cost analysis, and settings.
- **Modern Design**: Styled using utility classes and icons for a production-ready dashboard feel.

## Included Views

- **Analytical Portal**: Main dashboard with KPI cards and widget panels.
- **System Availability**: Uptime tracking and load activity overview.
- **Consumption Intelligence**: Filterable energy consumption by date/time window.
- **Billing & Tariffs**: Cost breakdown chart for day/night usage.
- **Alert Configuration**: Manage active fault alerts and threshold values.
- **Customize Workspace**: Enable or disable additional analytical widgets.

## Dependencies

This project is designed to run in a React environment with the following libraries:

- `react`
- `react-dom`
- `recharts`
- `lucide-react`

If you want to use this project, make sure your application includes those dependencies.

## Usage

1. Place `Energy_app.js` inside a React application.
2. Import and render the default `App` component:

```jsx
import App from './Energy_app';

function Root() {
  return <App />;
}

export default Root;
```

3. Ensure you have `recharts` and `lucide-react` installed:

```bash
npm install recharts lucide-react
```

4. Run your React app normally:

```bash
npm start
```

## Notes

- The app uses generated telemetry data and is intended as a demo/prototype.
- The data simulation logic in `Energy_app.js` can be extended to connect to real IoT or energy management APIs.
- UI behavior is driven by local React state and simple view switching.
