import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Tag, Descriptions, Empty } from 'antd';
import { vehicleApi } from '../api';

// ─── Load AMap (Gaode) JS API ───
// ─── Fallback: OpenStreetMap + Leaflet (免费，无需Key) ───
function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) { resolve((window as any).L); return; }
    // CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    // JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function MapPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const fetchVehicles = useCallback(async () => {
    try {
      const r = await vehicleApi.realtime();
      setVehicles(r.data || []);
      return r.data || [];
    } catch { return []; }
  }, []);

  // Initialize map
  useEffect(() => {
    let map: any;
    let L: any;

    const init = async () => {
      try {
        L = await loadLeaflet();
      } catch {
        setLoading(false);
        return;
      }

      if (!mapRef.current || mapInstanceRef.current) return;

      // Karachi center
      map = L.map(mapRef.current, {
        center: [24.8607, 67.0011],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Zoom control — top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;

      // Load vehicles and add markers
      const data = await fetchVehicles();
      addMarkers(L, map, data);
      setLoading(false);
    };

    init();

    // Refresh every 5s
    const iv = setInterval(async () => {
      const data = await fetchVehicles();
      if (mapInstanceRef.current && L) {
        addMarkers(L, mapInstanceRef.current, data);
      }
    }, 5000);

    return () => {
      clearInterval(iv);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  function addMarkers(L: any, map: any, data: any[]) {
    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const statusColors: Record<string, string> = {
      moving: '#3b82f6', idle: '#f59e0b', offline: '#55555f',
    };

    data.forEach((v: any) => {
      if (!v.latitude || !v.longitude) return;
      const color = statusColors[v.status] || '#55555f';

      // Custom circle marker
      const marker = L.circleMarker([v.latitude, v.longitude], {
        radius: 7,
        fillColor: color,
        fillOpacity: 0.9,
        color: '#fff',
        weight: 2,
        opacity: 0.9,
      }).addTo(map);

      // Glow effect for alert vehicles
      if (v.status === 'alert') {
        marker.setStyle({ fillColor: '#E31937', color: '#E31937' });
      }

      // Tooltip — plate number
      marker.bindTooltip(v.plate_number, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'vehicle-tooltip',
      });

      // Click handler
      marker.on('click', () => {
        setSelected(v);
        map.flyTo([v.latitude, v.longitude], 14, { duration: 0.8 });
      });

      markersRef.current.push(marker);
    });
  }

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 120px)' }}>
      {/* Map */}
      <Card style={{ flex: 1, overflow: 'hidden', padding: 0 }} styles={{ body: { padding: 0, height: '100%', position: 'relative' } }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(10,10,12,0.8)' }}>
            <Spin size="large" />
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0e0e12' }} />

        {/* Vehicle count overlay */}
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 500,
          background: 'rgba(18,18,24,0.92)', backdropFilter: 'blur(16px)',
          borderRadius: 10, padding: '10px 16px',
          border: '1px solid rgba(255,255,255,0.06)',
          fontSize: 13, fontWeight: 600, color: '#f0f0f2',
        }}>
          <span style={{ color: '#E31937', marginRight: 6 }}>●</span>{vehicles.length} 辆车在线
        </div>

        {/* Legend overlay */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 500,
          background: 'rgba(18,18,24,0.92)', backdropFilter: 'blur(16px)',
          borderRadius: 10, padding: '10px 14px',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {[{ l: '行驶中', c: '#3b82f6' }, { l: '静止', c: '#f59e0b' }, { l: '离线', c: '#55555f' }].map(i => (
            <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#8a8a96' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: i.c, boxShadow: `0 0 6px ${i.c}40` }} />{i.l}
            </div>
          ))}
        </div>
      </Card>

      {/* Detail Sidebar */}
      <Card style={{ width: 320, overflow: 'auto' }} styles={{ body: { padding: '20px' } }}>
        {selected ? (
          <>
            <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f0f2' }}>{selected.name}</h3>
            <Descriptions column={1} size="small"
              labelStyle={{ color: '#55555f', fontSize: 12, fontWeight: 500, paddingBottom: 10 }}
              contentStyle={{ fontSize: 14, fontWeight: 600, paddingBottom: 10, color: '#f0f0f2' }}>
              <Descriptions.Item label="车牌号">{selected.plate_number}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selected.status === 'moving' ? 'processing' : selected.status === 'idle' ? 'warning' : 'default'}>
                  {selected.status === 'moving' ? '行驶中' : selected.status === 'idle' ? '静止' : '离线'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="速度">{selected.speed?.toFixed(1) ?? 0} km/h</Descriptions.Item>
              <Descriptions.Item label="坐标">{selected.latitude?.toFixed(5)}, {selected.longitude?.toFixed(5)}</Descriptions.Item>
              <Descriptions.Item label="车队">{selected.fleet_id}</Descriptions.Item>
              <Descriptions.Item label="最后上报">{selected.last_report ? new Date(selected.last_report).toLocaleString('zh-CN') : '--'}</Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Empty description="点击地图上的车辆查看详情" style={{ marginTop: 80 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  );
}
