import '../../css/dashboard.css';
import logo from '../../logo.svg';
import { useState, useRef, useEffect } from 'react';

const ChatMsg = (props) => {
    return (
        <div className='msg' id={props.id}>
            <img src={'add image component here'} alt='Avatar' />
            <div className='text'>
                {props.text}
            </div>
        </div>
    )
}

const Dashboard = () => {

  const [log, setLog] = useState([
    {
      text: 'Car theft on 123 Avenue at 1:23 am',
    },
  ])

  const scroll = useRef()
  useEffect(() => {
    scroll.current.scrollIntoView(false)
  }, [log]);

  async function getAlert(prompt) {

  }

  async function getVisual(prompt) {
    document.getElementById('visuals').innerHTML = ''
    const graph = document.createElement('script')
    //graph.innerHTML = `${}`
    document.getElementById('visuals').appendChild(graph)
  }

  return (
    <div className='dashboard'>
      <div id='visuals'>
        <img src={logo} alt='Placeholder' />
      </div>

      <div className='chat'>
        <div className='versionheader'>
          Location Alerts
        </div>

        <div className='logcontainer'>
          <div ref={scroll}>
            {log.map((msg) => (
              <div>
                <ChatMsg
                  id={'severe'}
                  text={msg.text}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
