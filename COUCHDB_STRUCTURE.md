# CouchDB Document Structure & Multi-Dataset Design

## Overview

Unlike SQL databases with separate tables, CouchDB uses a single database with documents that can be organized using a `type` field. This design allows us to store multiple datasets (grain size, flow measurements, and future datasets) in the same database while maintaining clear separation.

## Document Structure

### Grain Size Documents (`type: "grain"`)

```json
{
  "_id": "grain_2024-01-15T10:30:00.000Z",
  "type": "grain",
  "grainSize": "Medium",
  "gps": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "string": "40.712800, -74.006000"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Flow Measurement Documents (`type: "flow"`)

```json
{
  "_id": "flow_2024-01-15T10:35:00.000Z",
  "type": "flow",
  "depth": 0.45,
  "velocity": 1.23,
  "distanceFromBank": 2.50,
  "gps": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "string": "40.712800, -74.006000"
  },
  "timestamp": "2024-01-15T10:35:00.000Z",
  "createdAt": "2024-01-15T10:35:00.000Z"
}
```

## Querying by Type

To query documents by type in CouchDB, you can:

1. **Using Mango Queries** (recommended):
```javascript
{
  "selector": {
    "type": "grain"
  }
}
```

2. **Using Views** (for better performance):
Create a view that indexes by type:
```javascript
function(doc) {
  if (doc.type) {
    emit(doc.type, doc);
  }
}
```

## Extending for Multiple Faculty/Datasets

### Option 1: Add a `faculty` or `dataset` Field

To support multiple faculty members or datasets, add a `faculty` or `dataset` field to each document:

```json
{
  "_id": "grain_2024-01-15T10:30:00.000Z",
  "type": "grain",
  "faculty": "professor_smith",  // or "dataset": "grain_size_study_2024"
  "grainSize": "Medium",
  ...
}
```

Then query by both type and faculty:
```javascript
{
  "selector": {
    "type": "grain",
    "faculty": "professor_smith"
  }
}
```

### Option 2: Use Separate Databases

For complete isolation, you could use separate CouchDB databases:
- `geology-data-professor-smith`
- `geology-data-professor-jones`
- etc.

However, this requires more management and doesn't leverage CouchDB's document-based flexibility.

### Option 3: Use a Composite Type Field

Combine type and faculty in the type field:
```json
{
  "type": "grain:professor_smith"
}
```

## Adding New Forms/Datasets

To add a new form for a different dataset:

1. **Create a new form component** (e.g., `SedimentForm.js`)

2. **Use a unique `type` field**:
```javascript
const doc = {
  _id: `sediment_${new Date().toISOString()}`,
  type: "sediment",  // Unique identifier
  // ... other fields
};
```

3. **Add route in App.js**:
```javascript
<Route path="/sediment" element={<SedimentForm />} />
```

4. **Query the new dataset**:
```javascript
{
  "selector": {
    "type": "sediment"
  }
}
```

## Benefits of This Approach

1. **Single Database**: All data in one place, easier to manage
2. **Flexible Schema**: Each document type can have different fields
3. **Easy Filtering**: Query by `type` field to get specific datasets
4. **Scalable**: Easy to add new document types without schema changes
5. **Future-Proof**: Can add `faculty`, `project`, or other organizational fields later

## GPS Collection

The app automatically collects GPS coordinates using the browser's Geolocation API:
- **Works on**: Phones, tablets, and devices with GPS
- **Fallback**: If GPS is unavailable, users can manually enter coordinates
- **Permissions**: Browser will prompt for location permission on first use

## Notes

- All documents include a `timestamp` field for when the data was recorded
- All documents include a `createdAt` field for when the document was created
- GPS coordinates are stored both as separate lat/lng and as a formatted string
- The `_id` field uses a prefix (`grain_`, `flow_`) to ensure uniqueness and easy identification

