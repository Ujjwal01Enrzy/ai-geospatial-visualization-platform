# UI Quick Reference - Developer Cheat Sheet

## 🎨 Design Tokens

### Colors
```javascript
// Primary (Blue)
primary-500: '#0F62FE'  // Main brand color
primary-100: light variant
primary-900: dark variant

// Accent (Green)
accent-500: '#00B894'   // Success, confirmations
accent-100: light variant
accent-900: dark variant

// Neutral (Grayscale)
neutral-50: '#F8FAFC'   // Light background
neutral-900: '#0F172A'  // Dark background
neutral-500: '#64748B'  // Mid-tone text

// Semantic
success: '#10B981'
warning: '#F59E0B'
error: '#EF4444'
info: '#3B82F6'
```

### Spacing (use as px-{value} or py-{value})
```
4, 8, 12, 16, 24, 32, 40
```

### Typography
```javascript
// Classes
text-h1       // 32px headlines
text-h2       // 26px subheadings
text-h3       // 22px section titles
text-h4       // 18px subsections
text-body     // 16px default text
text-body-sm  // 14px small text
text-caption  // 12px tiny text
```

---

## 🧩 Component Imports

```javascript
// UI Components
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LayerManager from '@/components/ui/LayerManager';

// Icons (Lucide React)
import { Play, Pause, Download, Upload, Settings } from 'lucide-react';
```

---

## 🔘 Button Component

### Basic Usage
```jsx
<Button variant="primary" size="md">
  Save Changes
</Button>
```

### With Icon
```jsx
import { Download } from 'lucide-react';

<Button 
  variant="accent" 
  icon={Download} 
  iconPosition="left"
>
  Export Data
</Button>
```

### Loading State
```jsx
<Button loading={isSubmitting} disabled={isSubmitting}>
  Processing...
</Button>
```

### Full Width
```jsx
<Button variant="primary" fullWidth>
  Sign In
</Button>
```

### Variants
- `primary` - Blue background (main actions)
- `secondary` - Gray background (secondary actions)
- `accent` - Green background (success actions)
- `ghost` - Transparent (tertiary actions)
- `icon` - Icon-only button

---

## 🪟 Modal Component

### Basic Modal
```jsx
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Open Modal
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Confirm Action"
        description="This action cannot be undone."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Confirm
            </Button>
          </>
        }
      >
        <p>Modal content goes here...</p>
      </Modal>
    </>
  );
}
```

### Sizes
- `sm` - max-w-md (small dialogs)
- `md` - max-w-2xl (default)
- `lg` - max-w-4xl (forms)
- `xl` - max-w-6xl (data tables)
- `full` - max-w-[90vw] (fullscreen)

---

## 📚 LayerManager Component

### Basic Usage
```jsx
import LayerManager from '@/components/ui/LayerManager';

const layers = [
  {
    id: 'layer-1',
    name: 'Satellite Imagery',
    type: 'raster',
    group: 'Base Layers',
    description: 'High-res satellite imagery from Sentinel-2',
    opacity: 100,
    legend: [
      { color: '#FF0000', label: 'Urban' },
      { color: '#00FF00', label: 'Forest' },
      { color: '#0000FF', label: 'Water' },
    ],
  },
  // ...more layers
];

function MapView() {
  const [activeLayers, setActiveLayers] = useState(['layer-1']);

  const handleToggleLayer = (layerId) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const handleOpacityChange = (layerId, opacity) => {
    // Update layer opacity in your state
  };

  return (
    <LayerManager
      layers={layers}
      activeLayers={activeLayers}
      onToggleLayer={handleToggleLayer}
      onOpacityChange={handleOpacityChange}
    />
  );
}
```

---

## 🎨 Utility Classes

### Layout
```jsx
// Flexbox
<div className="flex items-center justify-between gap-12">

// Grid
<div className="grid grid-cols-3 gap-16">

// Centering
<div className="flex-center">  // Flex center shorthand
```

### Cards
```jsx
// Static card
<div className="card p-16">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>

// Hoverable card
<div className="card-hover p-16">
  <h3>Interactive Card</h3>
</div>
```

### Badges
```jsx
<span className="badge-primary">Active</span>
<span className="badge-success">Completed</span>
<span className="badge-warning">Pending</span>
<span className="badge-error">Failed</span>
<span className="badge-accent">New</span>
```

### Inputs
```jsx
// Standard input
<input type="text" className="input" placeholder="Enter text..." />

// Error state
<input type="email" className="input-error" />
<p className="text-caption text-error mt-4">Invalid email address</p>
```

### Panels
```jsx
<div className="panel w-280 h-full">
  <div className="panel-header">
    <h2 className="text-h4">Panel Title</h2>
    <button className="btn-icon">×</button>
  </div>
  <div className="panel-content custom-scrollbar">
    <p>Panel content with custom scrollbar...</p>
  </div>
</div>
```

### Map Controls
```jsx
<button className="map-control p-8">
  <Plus className="w-20 h-20" />
</button>
```

### Floating Action Button
```jsx
<button className="fab">
  <Plus className="w-24 h-24" />
</button>
```

---

## 🌗 Dark Mode

### Toggle Implementation
```javascript
import { useThemeStore } from '@/store/themeStore';

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button onClick={toggleTheme} className="btn-icon">
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
}
```

### Using Dark Mode Classes
```jsx
<div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
  This text and background adapt to theme
</div>
```

---

## ♿ Accessibility

### ARIA Labels
```jsx
<button aria-label="Close modal" className="btn-icon">
  <X className="w-16 h-16" />
</button>
```

### Keyboard Shortcuts
```jsx
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
    if (e.key === 'l' && !e.target.tagName === 'INPUT') {
      toggleLayerManager();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Screen Reader Only Text
```jsx
<span className="sr-only">Additional context for screen readers</span>
```

### Focus Management
```jsx
import { useRef, useEffect } from 'react';

function Modal({ open }) {
  const focusTrapRef = useRef(null);

  useEffect(() => {
    if (open && focusTrapRef.current) {
      focusTrapRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={focusTrapRef} tabIndex={-1}>
      {/* Modal content */}
    </div>
  );
}
```

---

## 📊 Responsive Design

### Breakpoints
```javascript
// Tailwind breakpoints
sm: '640px'   // Small devices
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large screens
```

### Usage
```jsx
<div className="
  w-full        // Mobile: full width
  md:w-1/2      // Tablet: half width
  lg:w-1/3      // Desktop: third width
  p-16          // All: 16px padding
  md:p-24       // Tablet+: 24px padding
">
  Responsive content
</div>
```

### Hide/Show on Different Screens
```jsx
// Hidden on mobile, visible on desktop
<div className="hidden lg:block">Desktop only</div>

// Visible on mobile, hidden on desktop
<div className="block lg:hidden">Mobile only</div>
```

---

## 🎭 Animations

### Fade In
```jsx
<div className="animate-fade-in">
  Content fades in smoothly
</div>
```

### Slide In
```jsx
<div className="animate-slide-in">
  Content slides from left
</div>
```

### Slide Up (Bottom Sheet)
```jsx
<div className="animate-slide-up">
  Content slides from bottom
</div>
```

### Custom Delays
```jsx
<div className="animate-fade-in delay-100">Appears first</div>
<div className="animate-fade-in delay-200">Appears second</div>
<div className="animate-fade-in delay-300">Appears third</div>
```

---

## 🔌 API Integration

### axios Instance
```javascript
import api from '@/services/api';

// GET request
const response = await api.get('/api/datasets');

// POST request
const result = await api.post('/api/ai/run', {
  polygon: geojson,
  model: 'object-detection',
});

// With authorization
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### WebSocket
```javascript
import { io } from 'socket.io-client';

const socket = io(API_BASE_URL, {
  auth: { token: localStorage.getItem('token') },
});

// Listen for events
socket.on('job:progress', (data) => {
  console.log('Job progress:', data);
});

// Emit events
socket.emit('subscribe:alerts', { severity: 'high' });
```

---

## 🗺️ Map Integration

### Mapbox GL
```jsx
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

<Map
  mapboxAccessToken={MAPBOX_TOKEN}
  initialViewState={{
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  }}
  style={{ width: '100%', height: '100%' }}
  mapStyle="mapbox://styles/mapbox/satellite-v9"
/>
```

### Deck.gl Layers
```jsx
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';

const layers = [
  new GeoJsonLayer({
    id: 'geojson-layer',
    data: geojsonData,
    filled: true,
    getFillColor: [255, 0, 0, 100],
  }),
];

<DeckGL layers={layers} />
```

---

## 🎯 Common Patterns

### Loading State
```jsx
function DataTable() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  return <table>{/* Data */}</table>;
}
```

### Error Handling
```jsx
import { toast } from 'react-hot-toast';

try {
  await api.post('/api/datasets', formData);
  toast.success('Dataset created successfully!');
} catch (error) {
  toast.error(error.response?.data?.message || 'Failed to create dataset');
}
```

### Form Validation
```jsx
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={errors.email ? 'input-error' : 'input'}
      />
      {errors.email && (
        <p className="text-caption text-error mt-4">{errors.email}</p>
      )}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install dependencies
npm install

# Add new dependency
npm install package-name

# Add dev dependency
npm install --save-dev package-name
```

---

## 📝 File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── LayerManager.jsx
│   │   │   └── ...
│   │   ├── Layout.jsx       # App layout wrapper
│   │   ├── MapView.jsx      # Map component
│   │   └── Globe3DView.jsx  # 3D viewer
│   ├── views/               # Page-level components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── ...
│   ├── services/            # API services
│   │   └── api.js
│   ├── store/               # State management
│   │   └── index.js
│   ├── utils/               # Utility functions
│   ├── index.css            # Global styles + Tailwind
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

---

## 🎓 Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **Lucide Icons**: https://lucide.dev
- **React Docs**: https://react.dev
- **Vite Guide**: https://vitejs.dev/guide
- **Mapbox GL JS**: https://docs.mapbox.com/mapbox-gl-js
- **Deck.gl**: https://deck.gl
- **Cesium**: https://cesium.com/docs

---

**Quick Start**: Copy any code snippet and paste into your component!
**Need Help?**: Check `/UI_IMPLEMENTATION_GUIDE.md` for detailed documentation.

