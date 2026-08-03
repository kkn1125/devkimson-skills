---
name: mui
description: Material UI v9 component patterns for React and TypeScript, including installation, sx and styled styling, Grid, slots, responsive layouts, CSS theme variables, dark mode, and v7-to-v9 migration. Use when implementing, reviewing, or upgrading code that imports @mui/material, @mui/icons-material, or @mui/system.
---

# Material UI v9 Patterns

## Purpose

Target Material UI `9.2.x`, the current stable major as of 2026-08-03. Inspect the consuming project's `package.json` before changing code; preserve its installed major unless the user requests an upgrade.

For detailed examples, read only the relevant resource:

- `resources/component-library.md`: component and layout examples
- `resources/styling-guide.md`: `sx`, `styled`, slots, and CSS layers
- `resources/theme-customization.md`: themes, CSS variables, and color schemes

## Version and installation

Use compatible major versions for Material UI packages:

```bash
npm install @mui/material@^9.2.0 @mui/icons-material@^9.2.0 @emotion/react @emotion/styled
```

Material UI v9 supports React 17, 18, and 19 and requires TypeScript 4.9 or newer. With React 18 or older, align `react-is` to the React version through the package manager's override or resolution mechanism.

## v9 migration rules

- Replace `GridLegacy` and old `item`, `xs`, `sm`, `md`, `lg`, and `xl` item props with `Grid` and `size`.
- Use `slots` and `slotProps`; removed aliases such as `components`, `componentsProps`, `PaperProps`, `PopperProps`, and `TransitionComponent` must not appear in new code.
- Handle escape and backdrop dismissal through the `reason` argument of `Dialog` or `Modal` `onClose`; `disableEscapeKeyDown` is removed.
- When a button-like MUI component renders a custom element, set `nativeButton` to match whether the resolved element is a native `button`.
- Use pointer events for Slider gesture interception; use `onPointerDown`, not `onMouseDown`.
- Import icons with the `Outlined` suffix; legacy duplicate `Outline` exports are removed.
- Expect updated keyboard focus and DOM semantics in Tabs, Menu, MenuList, and Stepper. Test user-visible behavior and accessibility instead of asserting obsolete DOM structure.
- Do not use deep imports beyond public package exports.

### Grid migration

```tsx
import Grid from '@mui/material/Grid';

<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>Left</Grid>
  <Grid size={{ xs: 12, md: 6 }}>Right</Grid>
</Grid>
```

Use `offset={{ md: 2 }}`, `size="grow"`, or responsive objects when required. Do not add `item`.

### Slots

```tsx
<Tooltip
  title="Details"
  slots={{ transition: Fade }}
  slotProps={{ popper: { disablePortal: true }, transition: { timeout: 200 } }}
>
  <IconButton aria-label="Show details"><InfoOutlined /></IconButton>
</Tooltip>
```

### Dialog close reasons

```tsx
<Dialog
  open={open}
  onClose={(_event, reason) => {
    if (reason !== 'escapeKeyDown') setOpen(false);
  }}
>
  {/* content */}
</Dialog>
```

## Quick Start

### Basic MUI Component

```typescript
import { Box, Typography, Button, Paper } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

const styles: Record<string, SxProps<Theme>> = {
  container: {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  header: {
    mb: 3,
    fontSize: '1.5rem',
    fontWeight: 600,
  },
};

function MyComponent() {
  return (
    <Paper sx={styles.container}>
      <Typography sx={styles.header}>
        Title
      </Typography>
      <Button variant="contained">
        Action
      </Button>
    </Paper>
  );
}
```

---

## Styling Patterns

### Inline Styles (< 100 lines)

For components with simple styling, define styles at the top:

```typescript
import type { SxProps, Theme } from '@mui/material';

const componentStyles: Record<string, SxProps<Theme>> = {
  container: {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    mb: 2,
    color: 'primary.main',
  },
  button: {
    mt: 'auto',
    alignSelf: 'flex-end',
  },
};

function Component() {
  return (
    <Box sx={componentStyles.container}>
      <Typography sx={componentStyles.header}>Header</Typography>
      <Button sx={componentStyles.button}>Action</Button>
    </Box>
  );
}
```

### Separate Styles File (>= 100 lines)

For complex components, create separate style file:

```typescript
// UserProfile.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const userProfileStyles: Record<string, SxProps<Theme>> = {
  container: {
    p: 3,
    maxWidth: 800,
    mx: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  // ... many more styles
};

// UserProfile.tsx
import { userProfileStyles as styles } from './UserProfile.styles';

function UserProfile() {
  return <Box sx={styles.container}>...</Box>;
}
```

---

## Common Components

### Layout Components

```typescript
// Box - Generic container
<Box sx={{ p: 2, bgcolor: 'background.paper' }}>
  Content
</Box>

// Paper - Elevated surface
<Paper elevation={2} sx={{ p: 3 }}>
  Content
</Paper>

// Container - Centered content with max-width
<Container maxWidth="lg">
  Content
</Container>

// Stack - Flex container with spacing
<Stack spacing={2} direction="row">
  <Item />
  <Item />
</Stack>
```

### Grid System

```typescript
import { Grid } from '@mui/material';

// Responsive 12-column grid (Grid items no longer need `item`)
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    Left half
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    Right half
  </Grid>
</Grid>

// Responsive grid
<Grid container spacing={3}>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    Card
  </Grid>
  {/* Repeat for more cards */}
</Grid>
```

### Typography

```typescript
<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="body1">Body text</Typography>
<Typography variant="caption">Small text</Typography>

// With custom styling
<Typography
  variant="h4"
  sx={{
    color: 'primary.main',
    fontWeight: 600,
    mb: 2,
  }}
>
  Custom Heading
</Typography>
```

### Buttons

```typescript
// Variants
<Button variant="contained">Contained</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="text">Text</Button>

// Colors
<Button variant="contained" color="primary">Primary</Button>
<Button variant="contained" color="secondary">Secondary</Button>
<Button variant="contained" color="error">Error</Button>

// With icons
import { Add as AddIcon } from '@mui/icons-material';

<Button startIcon={<AddIcon />}>Add Item</Button>
```

---

## Theme Integration

### Using Theme Values

```typescript
import { useTheme } from '@mui/material';

function Component() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      Themed box
    </Box>
  );
}
```

### Theme in sx Prop

```typescript
<Box
  sx={{
    // Access theme in sx
    color: 'primary.main',          // theme.palette.primary.main
    bgcolor: 'background.paper',     // theme.palette.background.paper
    p: 2,                            // theme.spacing(2)
    borderRadius: 1,                 // theme.shape.borderRadius
  }}
>
  Content
</Box>

// Callback for advanced usage
<Box
  sx={(theme) => ({
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  })}
>
  Hover me
</Box>
```

---

## Responsive Design

### Breakpoints

```typescript
// Mobile-first responsive values
<Box
  sx={{
    width: {
      xs: '100%',    // 0-600px
      sm: '80%',     // 600-900px
      md: '60%',     // 900-1200px
      lg: '40%',     // 1200-1536px
      xl: '30%',     // 1536px+
    },
  }}
>
  Responsive width
</Box>

// Responsive display
<Box
  sx={{
    display: {
      xs: 'none',    // Hidden on mobile
      md: 'block',   // Visible on desktop
    },
  }}
>
  Desktop only
</Box>
```

### Responsive Typography

```typescript
<Typography
  sx={{
    fontSize: {
      xs: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
    lineHeight: {
      xs: 1.5,
      md: 1.75,
    },
  }}
>
  Responsive text
</Typography>
```

---

## Forms

```typescript
import { TextField, Stack, Button } from '@mui/material';

<Box component="form" onSubmit={handleSubmit}>
  <Stack spacing={2}>
    <TextField
      label="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      fullWidth
      required
      error={!!errors.email}
      helperText={errors.email}
    />
    <Button type="submit" variant="contained">Submit</Button>
  </Stack>
</Box>
```

---

## Common Patterns

### Card Component

```typescript
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';

<Card>
  <CardContent>
    <Typography variant="h5" component="div">
      Title
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Description
    </Typography>
  </CardContent>
  <CardActions>
    <Button size="small">Learn More</Button>
  </CardActions>
</Card>
```

### Dialog/Modal

```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Confirm Action</DialogTitle>
  <DialogContent>
    Are you sure you want to proceed?
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} variant="contained">
      Confirm
    </Button>
  </DialogActions>
</Dialog>
```

### Loading States

```typescript
import { CircularProgress, Skeleton } from '@mui/material';

// Spinner
<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
  <CircularProgress />
</Box>

// Skeleton
<Stack spacing={1}>
  <Skeleton variant="text" width="60%" />
  <Skeleton variant="rectangular" height={200} />
  <Skeleton variant="text" width="40%" />
</Stack>
```

---

## Icons

```typescript
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';

<Button startIcon={<AddIcon />}>Add</Button>
<IconButton onClick={handleDelete}><DeleteIcon /></IconButton>
```

---

## Best Practices

### 1. Type Your sx Props

```typescript
import type { SxProps, Theme } from '@mui/material';

// ✅ Good
const styles: Record<string, SxProps<Theme>> = {
  container: { p: 2 },
};

// ❌ Avoid
const styles = {
  container: { p: 2 }, // No type safety
};
```

### 2. Use Theme Tokens

```typescript
// ✅ Good: Use theme tokens
<Box sx={{ color: 'primary.main', p: 2 }} />

// ❌ Avoid: Hardcoded values
<Box sx={{ color: '#1976d2', padding: '16px' }} />
```

### 3. Consistent Spacing

```typescript
// ✅ Good: Use spacing scale
<Box sx={{ p: 2, mb: 3, mt: 1 }} />

// ❌ Avoid: Random pixel values
<Box sx={{ padding: '17px', marginBottom: '25px' }} />
```

---

## Additional Resources

Read only the resource needed for the task:

- [styling-guide.md](resources/styling-guide.md) - Advanced styling, slots, and CSS layers
- [component-library.md](resources/component-library.md) - Current component examples
- [theme-customization.md](resources/theme-customization.md) - Theme, CSS variables, and color schemes
