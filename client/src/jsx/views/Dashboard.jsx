import '../../css/dashboard.css';
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { heatLayer } from 'leaflet.heat';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useNavigate } from 'react-router-dom';
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import { createClient } from '@supabase/supabase-js';
import CircularProgress from '@mui/material/CircularProgress';

const supabase = createClient(process.env.REACT_APP_URL, process.env.REACT_APP_KEY)

const ChatMsg = (props) => {
  return (
    <div className='msg' style={{ backgroundColor: props.color }}>
      <LocalPoliceOutlinedIcon />
      <h5 className='text'>
        {props.text}
      </h5>
    </div>
  )
}

const Dashboard = () => {

  const previous = JSON.parse(localStorage.getItem('alertlog'))
  const [log, setLog] = useState(previous ? previous : [])
  const [isLoading, setIsLoading] = useState(false)

  const scroll = useRef()
  useEffect(() => {
    scroll.current.scrollIntoView(false)
  }, [log])

  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('alertlog', JSON.stringify(log))
  }, [log])

  useEffect(() => {
    let subscription = supabase
      .channel('todos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'CrimeReports' }, data => {
        let msg = data.new
        let time = msg.incident_datetime.split('T')[1].split('+')[0]
        let loc = !isNaN(msg.analysis_neighborhood) ? (msg.analysis_neighborhood) : (msg.police_district)
        console.log(msg)
        let newlog = {msg:`${time} ${msg.incident_description} (${loc})`, color:generateColor(msg.Severity)}

        setLog(prevlogs => [...prevlogs, newlog])
      })
      .subscribe()

    return async () => {
      subscription.unsubscribe()
      try {
        const { error } = await supabase
          .from('CrimeReports')
          .update({ Recent: true })
          .eq('Recent', false)
        if (error) {
          console.log(error)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }, [])

  const filterYear = (text, year) => {
    const rows = text.trim().split('\n').map(row => row.split(','))
    const header = rows.shift()

    const yearIndex = header.indexOf('Incident Year')
    const pointIndex = header.indexOf('Point')

    const data = rows.map(row => {
      const localyear = parseInt(row[yearIndex])
      let i = 1;
      let value = row[pointIndex]
      while (value.slice(0, 5) !== "POINT") {
        value = row[pointIndex + i]
        i += 1
        if (i == 10) {
          break;
        }
      }
      const pointData = value.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/);
      if (pointData && pointData.length === 3 && (year === -1 || localyear === year)) {
        return [parseFloat(pointData[2]), parseFloat(pointData[1])]
      } else {
        return null
      }
    }).filter(item => item !== null)

    return data
  }

  const filterSeverity = (text, severity_threshold) => {
    const rows = text.trim().split('\n').map(row => row.split(','))

    const data = rows.map(row => {

      const index = row.length - 1;
      let severity = row[index]

      if (severity < severity_threshold) {
        return null
      }
      return row
    }).filter(item => item !== null)

    return data.join('\n')
  }

  const generateColor = (severity) => {
    let red, green, blue
  
    if (severity >= 5) {
      red = 255;
      green = Math.round(255 - ((severity - 5) * (255 / 5)))
    } else {
      red = Math.round((severity / 5) * 255)
      green = 255;
    }
  
    blue = 0
  
    const redHex = red.toString(16).padStart(2, '0')
    const greenHex = green.toString(16).padStart(2, '0')
    const blueHex = blue.toString(16).padStart(2, '0')
  
    const colorHex = `#${redHex}${greenHex}${blueHex}`
  
    return colorHex
  }

  const getVisual = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('final_reports.csv')
      const csvText = await response.text()
      let data = filterYear(csvText, -1)

      if (data.length === 0) {
        throw new Error('No valid latitude and longitude data found.')
      }

      const sumLat = data.reduce((acc, val) => acc + parseFloat(val[0]), 0)
      const sumLng = data.reduce((acc, val) => acc + parseFloat(val[1]), 0)
      const meanLat = sumLat / data.length
      const meanLng = sumLng / data.length

      const heatAll = L.heatLayer(data, { radius: 10 })
      const geo = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })

      const heat24 = L.heatLayer(filterYear(csvText, 2024), { radius: 10 })
      const heat20 = L.heatLayer(filterYear(filterSeverity(csvText, 10), 2020), { radius: 10 })
      const heat18 = L.heatLayer(filterYear(csvText, 2018), { radius: 10 })
      const layers = [
        heatAll,
        geo,
        heat24,
        heat20,
        heat18,
      ]

      const map = L.map('map', {
        center: [meanLat, meanLng],
        zoom: 12,
        layers: layers
      })
      const layerControl = L.control.layers({
        '2024 Heatmap': heat24,
        '2020 Extreme Crime Heatmap': heat20,
        '2018 Heatmap': heat18,
        'Cumulative Heatmap': heatAll,
      }).addTo(map)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching or processing CSV data:', error)
    }
  }

  return (
    <div className='dashboard'>
      <div id='map'>
        {isLoading ? (
          <div className="loading-screen">
            <CircularProgress color="primary" />
          </div>
        ) : (<div className='placeholder'>
          <h3>Heatmap</h3>
          <MapOutlinedIcon fontSize='large' />
        </div>)}
      </div>

      <div className='chat'>
        <div className='header'>
          Crime Alerts
        </div>

        <div className='logcontainer'>
          <div ref={scroll}>
            {log.map((alert) => (
              <div>
                <ChatMsg
                  color={alert.color}
                  text={alert.msg}
                />
              </div>
            ))}
          </div>
        </div>

        <div className='footer'>
          <button id='mapgen' onClick={() => getVisual()}>
            Generate Map
          </button>
          <button id='notis' onClick={() => { navigate('/subscribe') }}>
            Get <NotificationsNoneOutlinedIcon />'s
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
