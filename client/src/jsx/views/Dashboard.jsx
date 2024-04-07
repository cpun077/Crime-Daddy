import '../../css/dashboard.css';
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { heatLayer } from 'leaflet.heat';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useNavigate } from 'react-router-dom';
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.REACT_APP_URL, process.env.REACT_APP_KEY)

const ChatMsg = (props) => {
  return (
    <div className='msg' id={props.id}>
      <LocalPoliceOutlinedIcon />
      <div className='text'>
        {props.text}
      </div>
    </div>
  )
}

const Dashboard = () => {

  const [log, setLog] = useState([])

  const scroll = useRef()
  useEffect(() => {
    scroll.current.scrollIntoView(false)
  }, [log])

  const navigate = useNavigate();

  useEffect(() => {
    getAlerts()
  }, [])

  const getAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('CrimeReports')
        .select('*')
        .eq('Recent', false)
        .limit(100)

      if (error) {
        console.log(error.message)
      } else {
        let newlogs = data.map(msg => {
          let time = msg.incident_datetime.split('T')[1].split('+')[0]
          let loc = !isNaN(msg.analysis_neighborhood) ? (msg.analysis_neighborhood) : (msg.police_district)
          return `${time} ${msg.incident_description} (${loc})`
        })
        console.log(newlogs)

        const { error: updateError } = await supabase
            .from('CrimeReports')
            .update({ Recent: true })
            .eq('Recent', false)
        if (updateError) {
          console.log(updateError)
        }
        setLog(prevlogs => [...prevlogs, ...newlogs])
      }
    } catch (error) {
      console.error('Error checking for duplicate email or inserting email:', error)
    }
  }

  const getVisual = async () => {
    try {
      const response = await fetch('testdata.csv')
      const csvText = await response.text();

      const rows = csvText.trim().split('\n')
      const header = rows[0].split(',').map(col => col.trim())
      const pointIndex = header.indexOf('Point')

      const data = rows.slice(1).map(row => {
        const columns = row.split(',').map(col => col.trim());
        const pointData = columns[pointIndex].match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/);
        if (pointData && pointData.length === 3) {
          return [parseFloat(pointData[2]), parseFloat(pointData[1])]
        } else {
          return null
        }
      }).filter(point => point !== null)

      if (data.length === 0) {
        throw new Error('No valid latitude and longitude data found.')
      }

      const sumLat = data.reduce((acc, val) => acc + parseFloat(val[0]), 0)
      const sumLng = data.reduce((acc, val) => acc + parseFloat(val[1]), 0)
      const meanLat = sumLat / data.length
      const meanLng = sumLng / data.length

      const map = L.map('map').setView([meanLat, meanLng], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      const heatmapLayer = L.heatLayer(data, { radius: 10 }).addTo(map);

    } catch (error) {
      console.error('Error fetching or processing CSV data:', error)
    }
  }

  return (
    <div className='dashboard'>
      <div id='map'>
        <div className='placeholder'>
          <h3>Heatmap</h3>
          <MapOutlinedIcon fontSize='large' />
        </div>
      </div>

      <div className='chat'>
        <div className='header'>
          Crime Alerts
        </div>

        <div className='logcontainer'>
          <div ref={scroll}>
            {log.map((msg) => (
              <div>
                <ChatMsg
                  id={'severe'}
                  text={msg}
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
