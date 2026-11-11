import React from 'react';
import './footer.css';

function FooterColumn({ children }) {
  return <div className='footer-column'>{children}</div>;
}

function FooterLink({ href, children }) {
  return (
    <a className='footer-link' href={href}>
      {children}
    </a>
  );
}

function Footer() {
  return (
    <footer className='footer'>
      <FooterColumn>
        <img src='/assets/nimbial-logo.svg' width={30} alt='' />
        <FooterLink href='https://www.nimbial.com'>nimbial.com</FooterLink>
        <div>© 2026 Made by Nimbial</div>
      </FooterColumn>
      <FooterColumn>
        <div>Symphony</div>
        <FooterLink href='https://symphony.nimbial.com/'>Home</FooterLink>
        <FooterLink href='https://symphony.nimbial.com/download'>Download</FooterLink>
        <FooterLink href='https://symphony.nimbial.com/support'>Donate</FooterLink>
      </FooterColumn>
      <FooterColumn>
        <div>Resources</div>
        <FooterLink href='/docs'>Nimbial Docs</FooterLink>
        <FooterLink href='/blog'>Blog</FooterLink>
      </FooterColumn>
      <FooterColumn>
        <div>Brand</div>
        <FooterLink href='/about'>About</FooterLink>
        <FooterLink href='/contact'>Contact</FooterLink>
        <FooterLink href='https://symphony.nimbial.com/ai'>Nimbial &amp; AI</FooterLink>
      </FooterColumn>
      <FooterColumn>
        <div>Legal</div>
        <FooterLink href='https://symphony.nimbial.com/terms-and-conditions'>Terms</FooterLink>
        <FooterLink href='https://symphony.nimbial.com/privacy-policy'>Privacy</FooterLink>
      </FooterColumn>
    </footer>
  );
}

export default Footer;
