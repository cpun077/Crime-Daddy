import '../../css/subscribe.css';
import { useFormik } from 'formik';
import { createClient } from '@supabase/supabase-js';
import { Alert, AlertTitle } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

const supabase = createClient(process.env.REACT_APP_URL, process.env.REACT_APP_KEY)

const Subscribe = () => {

    const [errorMsg, setErrorMsg] = useState('')
    const [errVis, setErrVis] = useState('visible')
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const onSubmit = async () => {
        try {
            const { data, error } = await supabase
                .from('CrimeEmails')
                .select('*')
                .eq('email', formik.values.email)

            if (error) {
                setErrorMsg(error.message)
                setErrVis(true)
            } else {
                if (data.length > 0) {
                    setErrorMsg('Email already subscribed!')
                    setErrVis(true)
                } else {
                    const { error: insertError } = await supabase
                        .from('CrimeEmails')
                        .insert({ email: formik.values.email })

                    if (insertError) {
                        setErrorMsg(insertError.message)
                        setErrVis(true)
                    } else {
                        setSuccess(true)
                    }
                }
            }
        } catch (error) {
            console.error('Error checking for duplicate email or inserting email:', error)
        }
    }

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        onSubmit,
    })

    return (
        success ? (
            <div className='sub' id='back'>
                <h1>Success!</h1>
                <button className='back' onClick={() => { navigate('/') }}>
                    <h3>Return to Dashboard</h3>
                    <ArrowBackOutlinedIcon />
                </button>
            </div>
        ) : (
            <div className='sub'>
                {errorMsg !== '' ?
                    (
                        <div id='errmsg' className='logerr' style={{ visibility: errVis, top: '20%' }}>
                            <Alert variant='filled' severity='error' >
                                <AlertTitle>{'Error Occured'}</AlertTitle>
                                <strong>{errorMsg}</strong>
                            </Alert>
                        </div>
                    ) : (<div></div>)
                }

                <button className='back' id='small' onClick={() => { navigate('/') }}>
                    <h3>Back</h3>
                    <ArrowBackOutlinedIcon />
                </button>

                <div className='card'>
                    <h2>Email Alerts</h2>

                    <div className='disclaimer'>By entering your email below you agree to receive notifications around the clock regarding crime in San Francisco.</div>

                    <form onSubmit={formik.handleSubmit}>

                        <div className='inputcontainer'>
                            <input
                                name='email'
                                type='email'
                                placeholder='Email'
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                required
                            />
                        </div>

                        <div className='buttoncontainer'>
                            <button type='submit'>Sign Up</button>
                        </div>
                    </form>
                </div>
            </div >
        )
    );
}

export default Subscribe;