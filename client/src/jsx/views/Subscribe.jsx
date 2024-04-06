import '../../css/subscribe.css';
import { useFormik } from 'formik';
import { createClient } from '@supabase/supabase-js';
import { Alert, AlertTitle } from '@mui/material';
import { useState } from 'react';

const supabase = createClient(process.env.REACT_APP_SUPABASE_ENDPOINT, process.env.REACT_APP_SUPABASE_KEY)

const Subscribe = () => {

    const [errorMsg, setErrorMsg] = useState('')
    const [errVis, setErrVis] = useState('visible')

    const onSubmit = async () => {
        try {
            const { data, duplicateError } = await supabase
                .from('CrimeEmails')
                .select('*')
                .eq('email', formik.values.email);
    
            if (duplicateError) {
                throw new Error(duplicateError.message);
            } else {
                if (data.length > 0) {
                    console.log('Duplicate email found:', formik.values.email);
                    setErrorMsg('Email already subscribed!')
                    setErrVis(true)
                } else {
                    const { error: insertError } = await supabase
                        .from('CrimeEmails')
                        .insert({ email: formik.values.email });
    
                    if (insertError) {
                        throw new Error(insertError.message);
                    } else {
                        console.log('Email inserted successfully: ', formik.values.email);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking for duplicate email or inserting email:', error);
        }
    }

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        onSubmit,
    })

    return (
        <div className='sub'>
            {errorMsg !== '' ? (
                <div id='errmsg' className='logerr' style={{ visibility: errVis, top: '20%' }}>
                    <Alert variant='outlined' severity='error' >
                        <AlertTitle>{'Error'}</AlertTitle>
                        <strong>{errorMsg}</strong>
                    </Alert>
                </div>
            ) : (<div></div>)}

            <div className='card'>
                <h2>Email Alerts</h2>

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
        </div>
    );
}

export default Subscribe;