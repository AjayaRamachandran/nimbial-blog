import React from 'react';
import './navbar.css';

function Navbar({ page }) {
  return (
    <>
      <div className='navbar'>
        <a className='title' href='/'>blog.nimbial.com</a>
        <a href='https://www.nimbial.com'><img src='/assets/favicon.svg' width='25' style={{borderRadius: '10px', outline: '1px solid black'}}></img></a>
      </div>
    </>
  );
}

export default Navbar;
