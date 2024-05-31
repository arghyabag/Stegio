import React, { useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import UploadButton from './UploadButton';
import { encode, decode } from '../steganography';
import { TypeAnimation } from 'react-type-animation';
import { FaGithub } from "react-icons/fa";

export default function App() {

  const [option, setOption] = useState('home');

  function handleClick(event) {

    const { name } = event.currentTarget;
    if (name === 'home') {
      setOption('home');
      document.getElementById('encoded-image').style.display = 'none';
    } else if (name === 'encode') {
      setOption('encode');
    } else if (name === 'decode') {
      setOption('decode');
    }
  }

  return (
    <div className='content'>
      <div className='top'>
      <h1>
     <span id="word"><TypeAnimation
      sequence={[
      
        'Hide', 
        1000, 
        'Secure',
        1000,
        'Encrypt',
        1000,
        
      ]}
      wrapper="span"
      speed={10}
      style={{  display: 'inline-block' }}
      repeat={Infinity}
    /></span>
    </h1>

      </div>
    
      <div className='main'>
      {option === 'home' && <Button style={{margin: '1rem'}} name='encode' onClick={handleClick} variant="contained">Encode</Button>}
      {option === 'home' && <Button style={{margin: '1rem'}} name='decode' onClick={handleClick} variant="contained">Decode</Button>}
      {option === 'encode' && (
  <TextField
    variant="filled"
    multiline
    type="text"
    id="secret"
    name="secret"
    placeholder="Enter secret message"
    label="Secret Message"
    InputProps={{
      style: {
        color: 'white', // White text color
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly transparent background
        backdropFilter: 'blur(5px)', // Background blur
      },
    }}
    InputLabelProps={{
      style: {
        color: 'white', // White label color
      },
    }}
  />
)}





      {option !== 'home' && <UploadButton />}
      {option === 'encode' && <Button style={{margin: '1rem'}} onClick={encode} variant="contained">Encode</Button>}
      {option === 'decode' && <Button style={{margin: '1rem'}} onClick={decode} variant="contained">Decode</Button>}
      {option !== 'home' && <Button style={{margin: '1rem'}} name='home' onClick={handleClick} variant="contained">Return</Button>}
      <img id="encoded-image" alt='encoded output'></img>
      
      <canvas id="canvas"></canvas>
      </div>
      
   
<div className="footer">
  <p className="footer-left">©{new Date().getFullYear()} Stegio All rights reserved.</p>
  <a href='https://github.com/arghyabag'><p className="footer-right"><FaGithub /> ARGHYA</p></a>
</div>

    </div>
  );
};
