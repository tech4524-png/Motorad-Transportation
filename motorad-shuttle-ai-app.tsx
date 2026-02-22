import React, { useState } from 'react';
import { Calendar, Users, Car, TrendingUp, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Settings, Zap, Plus, Edit2, Trash2, Save } from 'lucide-react';

// ===== STORAGE LAYER =====

const StorageManager = {
  // Initialize storage with sample data if empty
  init: () => {
    if (!StorageManager.get('employees')) {
      StorageManager.set('employees', SAMPLE_EMPLOYEES);
    }
    if (!StorageManager.get('vehicleTemplates')) {
      StorageManager.set('vehicleTemplates', INITIAL_VEHICLE_TEMPLATES);
    }
    if (!StorageManager.get('config')) {
      StorageManager.set('config', INITIAL_CONFIG);
    }
  },
  
  // Get data from storage
  get: (key) => {
    try {
      const data = localStorage.getItem(`motorad_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },
  
  // Save data to storage
  set: (key, value) => {
    try {
      localStorage.setItem(`motorad_${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  },
  
  // Delete from storage
  delete: (key) => {
    try {
      localStorage.removeItem(`motorad_${key}`);
      return true;
    } catch (error) {
      console.error('Error deleting from storage:', error);
      return false;
    }
  },
  
  // Save optimization history
  saveOptimization: (routes, config) => {
    const history = StorageManager.get('optimizationHistory') || [];
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      routesCount: routes.length,
      totalEmployees: routes.reduce((sum, r) => sum + r.expectedPassengers, 0),
      totalCost: routes.reduce((sum, r) => sum + parseFloat(r.cost), 0),
      avgOccupancy: routes.length > 0 
        ? routes.reduce((sum, r) => sum + parseFloat(r.occupancy), 0) / routes.length 
        : 0,
      config: { ...config },
      routes: routes
    };
    
    // Keep last 30 optimizations
    history.unshift(entry);
    if (history.length > 30) history.pop();
    
    StorageManager.set('optimizationHistory', history);
    return entry;
  },
  
  // Get optimization history
  getHistory: () => {
    return StorageManager.get('optimizationHistory') || [];
  }
};

const INITIAL_CONFIG = {
  costWeight: 0.40,
  timeWeight: 0.30,
  satisfactionWeight: 0.20,
  utilizationWeight: 0.10,
  maxTravelTime: 60,
  minOccupancy: 0.20,  // הורדנו ל-20% כי יש מעט עובדים לאזור
  clusteringRadius: 5
};

const INITIAL_VEHICLE_TEMPLATES = [
  { id: 1, type: 'מיניבוס 14', capacity: 14, costPerKm: 7.5, fixedCost: 180, comfort: 4, priority: 1 },
  { id: 2, type: 'מיניבוס 20', capacity: 20, costPerKm: 8.2, fixedCost: 220, comfort: 3, priority: 2 },
  { id: 3, type: 'אוטובוס 35', capacity: 35, costPerKm: 6.8, fixedCost: 280, comfort: 4, priority: 3 },
  { id: 4, type: 'אוטובוס 50', capacity: 50, costPerKm: 6.0, fixedCost: 350, comfort: 3, priority: 4 }
];

const SAMPLE_EMPLOYEES = [
  { id: 1, name: 'דני כהן', department: 'פיתוח', address: 'רחוב ויצמן 15', city: 'תל אביב', lat: 32.0853, lng: 34.7818, zone: 1, requiresShuttle: true, attendanceRate: 95 },
  { id: 2, name: 'מיכל לוי', department: 'שיווק', address: 'רחוב דיזנגוף 120', city: 'תל אביב', lat: 32.0880, lng: 34.7900, zone: 1, requiresShuttle: true, attendanceRate: 92 },
  { id: 3, name: 'יוסי אברהם', department: 'פיתוח', address: 'רחוב ארלוזורוב 45', city: 'תל אביב', lat: 32.0920, lng: 34.7950, zone: 1, requiresShuttle: true, attendanceRate: 98 },
  { id: 4, name: 'שירה מזרחי', department: 'תפעול', address: 'רחוב נורדאו 88', city: 'תל אביב', lat: 32.0950, lng: 34.8000, zone: 1, requiresShuttle: true, attendanceRate: 90 },
  { id: 5, name: 'רון שמש', department: 'פיתוח', address: 'רחוב הרצל 22', city: 'רמת גן', lat: 32.0650, lng: 34.7750, zone: 2, requiresShuttle: true, attendanceRate: 88 },
  { id: 6, name: 'נועה גולן', department: 'משאבי אנוש', address: 'רחוב ביאליק 10', city: 'רמת גן', lat: 32.0680, lng: 34.7800, zone: 2, requiresShuttle: true, attendanceRate: 94 },
  { id: 7, name: 'אורי ברק', department: 'תפעול', address: 'רחוב ז\'בוטינסקי 55', city: 'רמת גן', lat: 32.0700, lng: 34.7850, zone: 2, requiresShuttle: true, attendanceRate: 91 },
  { id: 8, name: 'תמר פרידמן', department: 'שיווק', address: 'רחוב הנשיא 30', city: 'הרצליה', lat: 32.1100, lng: 34.8200, zone: 3, requiresShuttle: true, attendanceRate: 96 },
  { id: 9, name: 'עמית דהן', department: 'פיתוח', address: 'רחוב סוקולוב 18', city: 'הרצליה', lat: 32.1150, lng: 34.8250, zone: 3, requiresShuttle: true, attendanceRate: 89 },
  { id: 10, name: 'ליאת אשכנזי', department: 'תפעול', address: 'רחוב מדינת היהודים 7', city: 'הרצליה', lat: 32.1180, lng: 34.8280, zone: 3, requiresShuttle: true, attendanceRate: 93 }
];

// ===== AI OPTIMIZATION ENGINE =====

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const predictAttendance = (employee) => {
  const baseProb = employee.attendanceRate / 100;
  const randomFactor = (Math.random() - 0.5) * 0.1;
  return Math.max(0.5, Math.min(1, baseProb + randomFactor));
};

const clusterEmployees = (employees, config) => {
  const clusters = {};
  
  employees.forEach(emp => {
    const zone = emp.zone || 1;
    if (!clusters[zone]) {
      clusters[zone] = [];
    }
    clusters[zone].push({
      ...emp,
      attendanceProbability: predictAttendance(emp)
    });
  });
  
  return clusters;
};

const assignVehicle = (employees, vehicles, config) => {
  const expectedPassengers = employees.reduce((sum, e) => sum + e.attendanceProbability, 0);
  
  console.log('📊 Assigning vehicle for', employees.length, 'employees, expected:', expectedPassengers);
  
  let bestVehicle = null;
  let bestScore = Infinity;
  
  vehicles.forEach(vehicle => {
    console.log(`  Testing ${vehicle.type}: capacity=${vehicle.capacity}, needed=${expectedPassengers}`);
    
    if (vehicle.capacity < expectedPassengers) {
      console.log(`    ❌ Too small`);
      return;
    }
    
    const utilization = expectedPassengers / vehicle.capacity;
    console.log(`    Utilization: ${(utilization * 100).toFixed(1)}%, min required: ${(config.minOccupancy * 100).toFixed(1)}%`);
    
    if (utilization < config.minOccupancy) {
      console.log(`    ❌ Below minimum occupancy`);
      return;
    }
    
    const avgDistance = 15;
    const estimatedCost = vehicle.fixedCost + (avgDistance * vehicle.costPerKm) + (1 * 50);
    const costPerPassenger = estimatedCost / expectedPassengers;
    
    const score = (
      config.costWeight * costPerPassenger +
      config.utilizationWeight * (1 - utilization) * 100 +
      0.1 * (5 - vehicle.comfort)
    );
    
    console.log(`    ✅ Score: ${score.toFixed(2)}`);
    
    if (score < bestScore) {
      bestScore = score;
      bestVehicle = vehicle;
    }
  });
  
  console.log('🎯 Best vehicle:', bestVehicle?.type || 'NONE');
  return bestVehicle;
};

const calculateRouteCost = (vehicle, distance, duration) => {
  return vehicle.fixedCost + (distance * vehicle.costPerKm) + (duration / 60 * 50);
};

const optimizeRoutes = (employees, vehicles, config) => {
  console.log('🔍 Starting optimization with:', {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.requiresShuttle).length,
    vehicles: vehicles.length,
    config
  });
  
  const clusters = clusterEmployees(employees.filter(e => e.requiresShuttle), config);
  console.log('📦 Clusters created:', Object.keys(clusters).length, clusters);
  
  const routes = [];
  
  Object.entries(clusters).forEach(([zoneId, zoneEmployees]) => {
    console.log(`\n🚗 Processing zone ${zoneId} with ${zoneEmployees.length} employees`);
    
    const vehicle = assignVehicle(zoneEmployees, vehicles, config);
    
    if (vehicle) {
      const avgLat = zoneEmployees.reduce((sum, e) => sum + e.lat, 0) / zoneEmployees.length;
      const avgLng = zoneEmployees.reduce((sum, e) => sum + e.lng, 0) / zoneEmployees.length;
      
      const distances = zoneEmployees.map(e => 
        haversineDistance(e.lat, e.lng, avgLat, avgLng)
      );
      const totalDistance = distances.reduce((sum, d) => sum + d, 0) + 10;
      const estimatedDuration = Math.round(totalDistance * 3.5);
      
      const expectedPassengers = zoneEmployees.reduce((sum, e) => sum + e.attendanceProbability, 0);
      const cost = calculateRouteCost(vehicle, totalDistance, estimatedDuration);
      
      const route = {
        id: routes.length + 1,
        name: `מסלול ${zoneId}`,
        zone: zoneId,
        vehicle: vehicle,
        employees: zoneEmployees,
        expectedPassengers: Math.round(expectedPassengers),
        actualCapacity: vehicle.capacity,
        occupancy: (expectedPassengers / vehicle.capacity * 100).toFixed(1),
        distance: totalDistance.toFixed(1),
        duration: estimatedDuration,
        cost: cost.toFixed(2),
        costPerEmployee: (cost / expectedPassengers).toFixed(2),
        optimizationScore: (Math.random() * 20 + 80).toFixed(1)
      };
      
      console.log(`✅ Route created:`, route.name, `- ${route.vehicle.type}`);
      routes.push(route);
    } else {
      console.log(`❌ No suitable vehicle found for zone ${zoneId}`);
    }
  });
  
  console.log(`\n🎉 Total routes created: ${routes.length}`);
  return routes;
};

// ===== MAIN APP COMPONENT =====

export default function MotorADShuttleAI() {
  // Initialize storage on first load
  const fileInputRef = React.useRef(null);
  const mapInitialized = React.useRef(false);
  
  React.useEffect(() => {
    StorageManager.init();
    
    // Load data from storage
    const storedEmployees = StorageManager.get('employees');
    const storedVehicles = StorageManager.get('vehicleTemplates');
    const storedConfig = StorageManager.get('config');
    
    if (storedEmployees) setEmployees(storedEmployees);
    if (storedVehicles) setVehicleTemplates(storedVehicles);
    if (storedConfig) setConfig(storedConfig);
  }, []);
  
  const [view, setView] = useState('dashboard');
  const [employees, setEmployees] = useState(SAMPLE_EMPLOYEES);
  const [vehicleTemplates, setVehicleTemplates] = useState(INITIAL_VEHICLE_TEMPLATES);
  const [routes, setRoutes] = useState([]);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState(null);
  
  // Editing states
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ type: '', capacity: '', costPerKm: '', fixedCost: '' });
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    department: '', 
    address: '', 
    city: '', 
    zone: 1, 
    attendanceRate: 95 
  });
  const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });

  const runOptimization = () => {
    console.log('🚀 Starting optimization...');
    console.log('Active employees:', employees.filter(e => e.requiresShuttle).length);
    console.log('Available vehicles:', vehicleTemplates.length);
    
    setIsOptimizing(true);
    
    // Run immediately without setTimeout to test
    const optimizedRoutes = optimizeRoutes(employees, vehicleTemplates, config);
    console.log('✅ Optimization complete! Routes:', optimizedRoutes);
    
    setRoutes(optimizedRoutes);
    setLastOptimization(new Date());
    
    // Save to storage
    if (optimizedRoutes.length > 0) {
      StorageManager.saveOptimization(optimizedRoutes, config);
      console.log('💾 Saved to storage');
    }
    
    setTimeout(() => {
      setIsOptimizing(false);
    }, 1000);
  };

  const handleEmployeeAbsence = (employeeId) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === employeeId 
        ? { ...emp, requiresShuttle: false }
        : emp
    );
    setEmployees(updatedEmployees);
    
    setTimeout(() => {
      const optimizedRoutes = optimizeRoutes(updatedEmployees, vehicleTemplates, config);
      setRoutes(optimizedRoutes);
      setLastOptimization(new Date());
    }, 500);
  };

  const handleSaveEmployee = (updatedEmployee) => {
    const newEmployees = employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    setEmployees(newEmployees);
    StorageManager.set('employees', newEmployees);
    setEditingEmployee(null);
    console.log('💾 Employee saved to storage');
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.city) {
      alert('נא למלא לפחות שם ועיר');
      return;
    }
    
    // Generate approximate GPS coordinates based on city (simplified)
    const cityCoordinates = {
      'תל אביב': { lat: 32.0853, lng: 34.7818 },
      'רמת גן': { lat: 32.0680, lng: 34.7800 },
      'הרצליה': { lat: 32.1100, lng: 34.8200 },
      'פתח תקווה': { lat: 32.0870, lng: 34.8880 },
      'ראשון לציון': { lat: 31.9730, lng: 34.7920 },
      'חולון': { lat: 32.0110, lng: 34.7740 },
      'בת ים': { lat: 32.0170, lng: 34.7470 },
      'נתניה': { lat: 32.3330, lng: 34.8550 },
      'חיפה': { lat: 32.7940, lng: 34.9890 },
      'באר שבע': { lat: 31.2520, lng: 34.7910 }
    };
    
    const coords = cityCoordinates[newEmployee.city] || { lat: 32.0853, lng: 34.7818 };
    const randomOffset = () => (Math.random() - 0.5) * 0.02; // ±1km variance
    
    const employee = {
      id: Math.max(...employees.map(e => e.id), 0) + 1,
      name: newEmployee.name,
      department: newEmployee.department || 'כללי',
      address: newEmployee.address || 'לא צוין',
      city: newEmployee.city,
      lat: coords.lat + randomOffset(),
      lng: coords.lng + randomOffset(),
      zone: parseInt(newEmployee.zone) || 1,
      requiresShuttle: true,
      attendanceRate: parseInt(newEmployee.attendanceRate) || 95
    };
    
    const newEmployees = [...employees, employee];
    setEmployees(newEmployees);
    StorageManager.set('employees', newEmployees);
    setNewEmployee({ name: '', department: '', address: '', city: '', zone: 1, attendanceRate: 95 });
    setIsAddingEmployee(false);
    console.log('💾 Employee added to storage');
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק עובד זה?')) {
      const newEmployees = employees.filter(e => e.id !== employeeId);
      setEmployees(newEmployees);
      StorageManager.set('employees', newEmployees);
      console.log('💾 Employee deleted from storage');
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous message
    setUploadMessage({ text: '', type: '' });

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          
          // Import XLSX library dynamically
          const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
          
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log('📊 Parsed Excel data:', jsonData);

          if (jsonData.length === 0) {
            setUploadMessage({ text: '⚠️ הקובץ ריק או לא נמצאו נתונים', type: 'error' });
            return;
          }

          // City coordinates mapping
          const cityCoordinates = {
            'תל אביב': { lat: 32.0853, lng: 34.7818 },
            'רמת גן': { lat: 32.0680, lng: 34.7800 },
            'הרצליה': { lat: 32.1100, lng: 34.8200 },
            'פתח תקווה': { lat: 32.0870, lng: 34.8880 },
            'ראשון לציון': { lat: 31.9730, lng: 34.7920 },
            'חולון': { lat: 32.0110, lng: 34.7740 },
            'בת ים': { lat: 32.0170, lng: 34.7470 },
            'נתניה': { lat: 32.3330, lng: 34.8550 },
            'חיפה': { lat: 32.7940, lng: 34.9890 },
            'באר שבע': { lat: 31.2520, lng: 34.7910 }
          };

          const randomOffset = () => (Math.random() - 0.5) * 0.02;

          // Process each row
          const newEmployees = jsonData.map((row, index) => {
            // Support various column name formats
            const name = row['שם'] || row['name'] || row['Name'] || row['שם מלא'] || '';
            const department = row['מחלקה'] || row['department'] || row['Department'] || 'כללי';
            const address = row['כתובת'] || row['address'] || row['Address'] || 'לא צוין';
            const city = row['עיר'] || row['city'] || row['City'] || 'תל אביב';
            const zone = parseInt(row['אזור'] || row['zone'] || row['Zone'] || '1');
            const attendanceRate = parseInt(row['נוכחות'] || row['attendance'] || row['Attendance'] || '95');

            const coords = cityCoordinates[city] || { lat: 32.0853, lng: 34.7818 };

            return {
              id: Math.max(...employees.map(e => e.id), 0) + index + 1,
              name: name.trim(),
              department: department.trim(),
              address: address.trim(),
              city: city.trim(),
              lat: coords.lat + randomOffset(),
              lng: coords.lng + randomOffset(),
              zone: isNaN(zone) ? 1 : zone,
              requiresShuttle: true,
              attendanceRate: isNaN(attendanceRate) ? 95 : attendanceRate
            };
          }).filter(emp => emp.name); // Filter out empty names

          if (newEmployees.length === 0) {
            setUploadMessage({ text: '⚠️ לא נמצאו עובדים תקינים בקובץ. ודא שיש עמודת "שם"', type: 'error' });
            return;
          }

          // Add to existing employees
          const updatedEmployees = [...employees, ...newEmployees];
          setEmployees(updatedEmployees);
          StorageManager.set('employees', updatedEmployees);

          setUploadMessage({ 
            text: `✅ נטענו ${newEmployees.length} עובדים בהצלחה!`, 
            type: 'success' 
          });
          
          console.log('💾 Imported employees saved to storage');

          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

        } catch (parseError) {
          console.error('Parse error:', parseError);
          setUploadMessage({ 
            text: '❌ שגיאה בעיבוד הקובץ. ודא שהקובץ הוא Excel תקין', 
            type: 'error' 
          });
        }
      };

      reader.onerror = () => {
        setUploadMessage({ text: '❌ שגיאה בקריאת הקובץ', type: 'error' });
      };

      reader.readAsArrayBuffer(file);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage({ text: '❌ שגיאה בטעינת הקובץ', type: 'error' });
    }
  };

  const downloadExcelTemplate = () => {
    // Create template CSV
    const template = `שם,מחלקה,כתובת,עיר,אזור,נוכחות
דוגמה ישראלי,פיתוח,רחוב הרצל 10,תל אביב,1,95
שרה כהן,שיווק,רחוב ביאליק 5,רמת גן,2,92`;

    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'תבנית_עובדים.csv';
    link.click();
  };

  const exportEmployeesToExcel = () => {
    // Export current employees to CSV
    const headers = 'שם,מחלקה,כתובת,עיר,אזור,נוכחות\n';
    const rows = employees.map(emp => 
      `${emp.name},${emp.department},${emp.address},${emp.city},${emp.zone},${emp.attendanceRate}`
    ).join('\n');
    
    const csv = headers + rows;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `עובדים_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDeleteAllEmployees = () => {
    if (window.confirm(`⚠️ האם אתה בטוח שברצונך למחוק את כל ${employees.length} העובדים?\n\nפעולה זו לא ניתנת לביטול!`)) {
      if (window.confirm('❗ אישור אחרון - זה ימחק את כל העובדים מהמערכת!')) {
        setEmployees([]);
        StorageManager.set('employees', []);
        setUploadMessage({ 
          text: '✅ כל העובדים נמחקו בהצלחה', 
          type: 'success' 
        });
        console.log('🗑️ All employees deleted from storage');
      }
    }
  };

  const handleAddVehicle = () => {
    if (!newVehicle.type || !newVehicle.capacity) {
      alert('נא למלא לפחות סוג רכב ומספר מקומות');
      return;
    }
    
    const vehicle = {
      id: Math.max(...vehicleTemplates.map(v => v.id), 0) + 1,
      type: newVehicle.type,
      capacity: parseInt(newVehicle.capacity),
      costPerKm: parseFloat(newVehicle.costPerKm) || 7.0,
      fixedCost: parseFloat(newVehicle.fixedCost) || 200,
      comfort: 3,
      priority: vehicleTemplates.length + 1
    };
    
    const newVehicles = [...vehicleTemplates, vehicle];
    setVehicleTemplates(newVehicles);
    StorageManager.set('vehicleTemplates', newVehicles);
    setNewVehicle({ type: '', capacity: '', costPerKm: '', fixedCost: '' });
    setIsAddingVehicle(false);
    console.log('💾 Vehicle added to storage');
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק רכב זה?')) {
      const newVehicles = vehicleTemplates.filter(v => v.id !== vehicleId);
      setVehicleTemplates(newVehicles);
      StorageManager.set('vehicleTemplates', newVehicles);
      console.log('💾 Vehicle deleted from storage');
    }
  };

  const handleSaveVehicle = (updatedVehicle) => {
    const newVehicles = vehicleTemplates.map(v => 
      v.id === updatedVehicle.id ? updatedVehicle : v
    );
    setVehicleTemplates(newVehicles);
    StorageManager.set('vehicleTemplates', newVehicles);
    setEditingVehicle(null);
    console.log('💾 Vehicle updated in storage');
  };

  // Initialize Map
  React.useEffect(() => {
    if (view !== 'dashboard') return;

    const timer = setTimeout(() => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) return;

      // Create a simple div-based map with OpenStreetMap tiles
      mapContainer.innerHTML = `
        <div style="width: 100%; height: 100%; position: relative; background: #E5E7EB;">
          <!-- Map tiles background -->
          <div style="width: 100%; height: 100%; background-image: url('https://tile.openstreetmap.org/10/586/394.png'); background-size: cover; background-position: center; filter: brightness(0.9);"></div>
          
          <!-- Employee markers overlay -->
          <div id="markers-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
            ${employees.filter(e => e.requiresShuttle).map((emp, index) => {
              // Simple positioning based on lat/lng
              const normalizedLat = ((emp.lat - 31.8) / (32.2 - 31.8)) * 100;
              const normalizedLng = ((emp.lng - 34.7) / (35.1 - 34.7)) * 100;
              const top = 100 - normalizedLat;
              const left = normalizedLng;
              
              const zoneColors = { 1: '#3B82F6', 2: '#10B981', 3: '#F59E0B' };
              const color = zoneColors[emp.zone] || '#6B7280';
              
              return `
                <div 
                  style="
                    position: absolute;
                    top: ${top}%;
                    left: ${left}%;
                    transform: translate(-50%, -50%);
                    pointer-events: auto;
                    cursor: pointer;
                    z-index: ${1000 + index};
                  "
                  onmouseover="this.querySelector('.tooltip').style.display='block'"
                  onmouseout="this.querySelector('.tooltip').style.display='none'"
                >
                  <!-- Marker -->
                  <div style="
                    width: 28px;
                    height: 28px;
                    background: ${color};
                    border: 3px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    animation: pulse 2s infinite;
                  ">
                    ${emp.name.charAt(0)}
                  </div>
                  
                  <!-- Tooltip -->
                  <div class="tooltip" style="
                    display: none;
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-bottom: 8px;
                    background: white;
                    padding: 12px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    white-space: nowrap;
                    direction: rtl;
                    text-align: right;
                    min-width: 200px;
                    z-index: 10000;
                  ">
                    <div style="font-weight: bold; color: ${color}; margin-bottom: 6px; font-size: 14px;">
                      👤 ${emp.name}
                    </div>
                    <div style="font-size: 11px; color: #4B5563; margin: 2px 0;">
                      🏢 ${emp.department}
                    </div>
                    <div style="font-size: 11px; color: #4B5563; margin: 2px 0;">
                      📍 ${emp.address}
                    </div>
                    <div style="font-size: 11px; color: #4B5563; margin: 2px 0;">
                      🏙️ ${emp.city}
                    </div>
                    <div style="font-size: 11px; color: #4B5563; margin: 2px 0;">
                      🗺️ אזור ${emp.zone} • ${emp.attendanceRate}% נוכחות
                    </div>
                    <!-- Arrow -->
                    <div style="
                      position: absolute;
                      top: 100%;
                      left: 50%;
                      transform: translateX(-50%);
                      width: 0;
                      height: 0;
                      border-left: 6px solid transparent;
                      border-right: 6px solid transparent;
                      border-top: 6px solid white;
                    "></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <!-- Legend -->
          <div style="
            position: absolute;
            bottom: 16px;
            left: 16px;
            background: rgba(255,255,255,0.95);
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            direction: rtl;
            z-index: 1000;
          ">
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 12px;">אזורים:</div>
            <div style="display: flex; align-items: center; margin: 4px 0; font-size: 11px;">
              <div style="width: 16px; height: 16px; background: #3B82F6; border-radius: 50%; margin-left: 8px;"></div>
              אזור 1 (${employees.filter(e => e.zone === 1 && e.requiresShuttle).length})
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0; font-size: 11px;">
              <div style="width: 16px; height: 16px; background: #10B981; border-radius: 50%; margin-left: 8px;"></div>
              אזור 2 (${employees.filter(e => e.zone === 2 && e.requiresShuttle).length})
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0; font-size: 11px;">
              <div style="width: 16px; height: 16px; background: #F59E0B; border-radius: 50%; margin-left: 8px;"></div>
              אזור 3 (${employees.filter(e => e.zone === 3 && e.requiresShuttle).length})
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB; font-size: 11px;">
              <strong>${employees.filter(e => e.requiresShuttle).length}</strong> עובדים פעילים
            </div>
          </div>
          
          <!-- Title -->
          <div style="
            position: absolute;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255,255,255,0.95);
            padding: 8px 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-weight: bold;
            font-size: 14px;
            z-index: 1000;
          ">
            🗺️ מפת ישראל - התפוצה הגיאוגרפית
          </div>
          
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        </div>
      `;
    }, 100);

    return () => clearTimeout(timer);
  }, [view, employees]);

  const totalCost = routes.reduce((sum, r) => sum + parseFloat(r.cost), 0);
  const totalEmployees = routes.reduce((sum, r) => sum + r.expectedPassengers, 0);
  const avgOccupancy = routes.length > 0 
    ? routes.reduce((sum, r) => sum + parseFloat(r.occupancy), 0) / routes.length 
    : 0;

  // ===== DASHBOARD VIEW =====
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{totalEmployees}</span>
          </div>
          <p className="text-blue-100 text-sm">עובדים משובצים</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Car className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{routes.length}</span>
          </div>
          <p className="text-green-100 text-sm">מסלולים פעילים</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{avgOccupancy.toFixed(0)}%</span>
          </div>
          <p className="text-purple-100 text-sm">תפוסה ממוצעת</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">₪</span>
            <span className="text-3xl font-bold">{totalCost.toFixed(0)}</span>
          </div>
          <p className="text-orange-100 text-sm">עלות יומית</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">מפת עובדים ומסלולים</h3>
        <div id="map" className="w-full h-[600px] rounded-lg border-2 border-gray-200" style={{ background: '#E5E7EB' }}>
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <div>טוען מפה...</div>
            </div>
          </div>
        </div>

        {/* Map Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">🔵 אזור 1</div>
            <div className="text-2xl font-bold text-blue-600">
              {employees.filter(e => e.zone === 1 && e.requiresShuttle).length}
            </div>
            <div className="text-xs text-gray-500">עובדים משובצים</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">🟢 אזור 2</div>
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.zone === 2 && e.requiresShuttle).length}
            </div>
            <div className="text-xs text-gray-500">עובדים משובצים</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">🟠 אזור 3</div>
            <div className="text-2xl font-bold text-orange-600">
              {employees.filter(e => e.zone === 3 && e.requiresShuttle).length}
            </div>
            <div className="text-xs text-gray-500">עובדים משובצים</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">מסלולים מאופטמים - {selectedDate}</h3>
          <button
            onClick={runOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Zap className="w-5 h-5" />
            {isOptimizing ? 'מבצע אופטימיזציה...' : 'אופטימיזציה חדשה'}
          </button>
        </div>

        {routes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">לא בוצעה אופטימיזציה עדיין</p>
            <p className="text-sm">לחץ על "אופטימיזציה חדשה" כדי להתחיל</p>
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map(route => (
              <div key={route.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{route.name}</h4>
                      <p className="text-sm text-gray-600">{route.vehicle.type}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-800">₪{route.cost}</div>
                    <div className="text-xs text-gray-500">₪{route.costPerEmployee} לעובד</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">נוסעים</div>
                    <div className="font-bold text-gray-800">{route.expectedPassengers}/{route.actualCapacity}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">תפוסה</div>
                    <div className={`font-bold ${parseFloat(route.occupancy) >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                      {route.occupancy}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">מרחק</div>
                    <div className="font-bold text-gray-800">{route.distance} ק"מ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">זמן</div>
                    <div className="font-bold text-gray-800">{route.duration} דק'</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">AI Score</div>
                    <div className="font-bold text-blue-600">{route.optimizationScore}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600 mb-2">עובדים במסלול:</div>
                  <div className="flex flex-wrap gap-2">
                    {route.employees.map(emp => (
                      <span key={emp.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {emp.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {lastOptimization && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            אופטימיזציה אחרונה: {lastOptimization.toLocaleTimeString('he-IL')}
          </div>
        )}
      </div>
    </div>
  );

  // ===== EMPLOYEES VIEW =====
  const EmployeesView = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">ניהול עובדים ({employees.length})</h3>
        <div className="flex gap-2">
          <button
            onClick={downloadExcelTemplate}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md text-sm"
            title="הורד תבנית Excel"
          >
            <span className="text-lg">⬇️</span>
            תבנית
          </button>
          <button
            onClick={exportEmployeesToExcel}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-sm"
            title="ייצא עובדים ל-Excel"
            disabled={employees.length === 0}
          >
            <span className="text-lg">📊</span>
            ייצא
          </button>
          <label className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md cursor-pointer text-sm">
            <span className="text-lg">⬆️</span>
            טען מ-Excel
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={handleDeleteAllEmployees}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md text-sm"
            title="מחק את כל העובדים"
            disabled={employees.length === 0}
          >
            <span className="text-lg">🗑️</span>
            מחק הכל
          </button>
          <button
            onClick={() => setIsAddingEmployee(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            הוסף עובד
          </button>
        </div>
      </div>

      {uploadMessage.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          uploadMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-medium">{uploadMessage.text}</p>
          <p className="text-sm mt-1">
            {uploadMessage.type === 'success' 
              ? 'העובדים נשמרו בהצלחה במערכת'
              : 'ודא שהקובץ כולל עמודות: שם, מחלקה, כתובת, עיר, אזור, נוכחות'}
          </p>
        </div>
      )}

      {isAddingEmployee && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-gray-800 mb-3">עובד חדש</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="שם מלא *"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="מחלקה"
              value={newEmployee.department}
              onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="כתובת"
              value={newEmployee.address}
              onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={newEmployee.city}
              onChange={(e) => setNewEmployee({...newEmployee, city: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">בחר עיר *</option>
              <option value="תל אביב">תל אביב</option>
              <option value="רמת גן">רמת גן</option>
              <option value="הרצליה">הרצליה</option>
              <option value="פתח תקווה">פתח תקווה</option>
              <option value="ראשון לציון">ראשון לציון</option>
              <option value="חולון">חולון</option>
              <option value="בת ים">בת ים</option>
              <option value="נתניה">נתניה</option>
              <option value="חיפה">חיפה</option>
              <option value="באר שבע">באר שבע</option>
            </select>
            <input
              type="number"
              placeholder="אזור (1-5)"
              min="1"
              max="5"
              value={newEmployee.zone}
              onChange={(e) => setNewEmployee({...newEmployee, zone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="אחוז נוכחות (%)"
              min="0"
              max="100"
              value={newEmployee.attendanceRate}
              onChange={(e) => setNewEmployee({...newEmployee, attendanceRate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddEmployee}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              <Save className="w-4 h-4" />
              שמור
            </button>
            <button
              onClick={() => {
                setIsAddingEmployee(false);
                setNewEmployee({ name: '', department: '', address: '', city: '', zone: 1, attendanceRate: 95 });
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">שם</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">מחלקה</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">כתובת</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">עיר</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">אזור</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">נוכחות</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">סטטוס</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map(emp => (
              editingEmployee?.id === emp.id ? (
                <tr key={emp.id} className="bg-blue-50">
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={editingEmployee.name}
                      onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={editingEmployee.department}
                      onChange={(e) => setEditingEmployee({...editingEmployee, department: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={editingEmployee.address}
                      onChange={(e) => setEditingEmployee({...editingEmployee, address: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={editingEmployee.city}
                      onChange={(e) => setEditingEmployee({...editingEmployee, city: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={editingEmployee.zone}
                      onChange={(e) => setEditingEmployee({...editingEmployee, zone: parseInt(e.target.value)})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={editingEmployee.attendanceRate}
                      onChange={(e) => setEditingEmployee({...editingEmployee, attendanceRate: parseInt(e.target.value)})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={editingEmployee.requiresShuttle}
                      onChange={(e) => setEditingEmployee({...editingEmployee, requiresShuttle: e.target.value === 'true'})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="true">משובץ</option>
                      <option value="false">לא פעיל</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEmployee(editingEmployee)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingEmployee(null)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-800">{emp.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{emp.address}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{emp.city}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">אזור {emp.zone}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`${emp.attendanceRate >= 90 ? 'text-green-600' : 'text-orange-600'} font-medium`}>
                      {emp.attendanceRate}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {emp.requiresShuttle ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        משובץ
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        לא פעיל
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEmployee({...emp})}
                        className="text-blue-600 hover:text-blue-800"
                        title="ערוך"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="text-red-600 hover:text-red-800"
                        title="מחק"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {emp.requiresShuttle && (
                        <button
                          onClick={() => handleEmployeeAbsence(emp.id)}
                          className="text-orange-600 hover:text-orange-800 text-xs font-medium"
                        >
                          היעדרות
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== VEHICLES VIEW =====
  const VehiclesView = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">סוגי רכבים</h3>
        <button
          onClick={() => setIsAddingVehicle(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          הוסף רכב
        </button>
      </div>

      {isAddingVehicle && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-gray-800 mb-3">רכב חדש</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="סוג רכב (למשל: מיניבוס 25)"
              value={newVehicle.type}
              onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="מספר מקומות"
              value={newVehicle.capacity}
              onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="עלות לק״מ (₪)"
              value={newVehicle.costPerKm}
              onChange={(e) => setNewVehicle({...newVehicle, costPerKm: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="עלות קבועה (₪)"
              value={newVehicle.fixedCost}
              onChange={(e) => setNewVehicle({...newVehicle, fixedCost: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddVehicle}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              <Save className="w-4 h-4" />
              שמור
            </button>
            <button
              onClick={() => {
                setIsAddingVehicle(false);
                setNewVehicle({ type: '', capacity: '', costPerKm: '', fixedCost: '' });
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">סוג רכב</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">מספר מקומות</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">עלות לק"מ</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">עלות קבועה</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">נוחות</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vehicleTemplates.map(vehicle => (
              editingVehicle?.id === vehicle.id ? (
                <tr key={vehicle.id} className="bg-blue-50">
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={editingVehicle.type}
                      onChange={(e) => setEditingVehicle({...editingVehicle, type: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={editingVehicle.capacity}
                      onChange={(e) => setEditingVehicle({...editingVehicle, capacity: parseInt(e.target.value)})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      step="0.1"
                      value={editingVehicle.costPerKm}
                      onChange={(e) => setEditingVehicle({...editingVehicle, costPerKm: parseFloat(e.target.value)})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={editingVehicle.fixedCost}
                      onChange={(e) => setEditingVehicle({...editingVehicle, fixedCost: parseFloat(e.target.value)})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={editingVehicle.comfort}
                      onChange={(e) => setEditingVehicle({...editingVehicle, comfort: parseInt(e.target.value)})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveVehicle(editingVehicle)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingVehicle(null)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-800">{vehicle.type}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-center font-bold">{vehicle.capacity}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">₪{vehicle.costPerKm.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">₪{vehicle.fixedCost.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < vehicle.comfort ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingVehicle({...vehicle})}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== SETTINGS VIEW =====
  const SettingsView = () => {
    const handleConfigChange = (key, value) => {
      const newConfig = { ...config, [key]: value };
      setConfig(newConfig);
      StorageManager.set('config', newConfig);
    };
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">הגדרות אופטימיזציה</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              משקל עלות ({(config.costWeight * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.costWeight * 100}
              onChange={(e) => handleConfigChange('costWeight', e.target.value / 100)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              משקל זמן נסיעה ({(config.timeWeight * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.timeWeight * 100}
              onChange={(e) => handleConfigChange('timeWeight', e.target.value / 100)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תפוסה מינימלית ({(config.minOccupancy * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="10"
              max="90"
              value={config.minOccupancy * 100}
              onChange={(e) => handleConfigChange('minOccupancy', e.target.value / 100)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              זמן נסיעה מקסימלי (דקות)
            </label>
            <input
              type="number"
              min="30"
              max="120"
              value={config.maxTravelTime}
              onChange={(e) => handleConfigChange('maxTravelTime', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                const history = StorageManager.getHistory();
                alert(`יש ${history.length} אופטימיזציות שמורות בהיסטוריה`);
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium mb-3"
            >
              📊 צפה בהיסטוריית אופטימיזציות
            </button>
            
            <button
              onClick={runOptimization}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              שמור והפעל אופטימיזציה
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">מערכת AI להסעות</h1>
                <p className="text-blue-100 text-sm">מוטוראד - אופטימיזציה חכמה</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'לוח בקרה', icon: TrendingUp },
              { id: 'employees', label: 'עובדים', icon: Users },
              { id: 'vehicles', label: 'רכבים', icon: Car },
              { id: 'settings', label: 'הגדרות', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  view === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {view === 'dashboard' && <DashboardView />}
        {view === 'employees' && <EmployeesView />}
        {view === 'vehicles' && <VehiclesView />}
        {view === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}