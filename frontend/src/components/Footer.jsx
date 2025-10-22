import React from 'react'
import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsTwitterX } from 'react-icons/bs';

export default function FooterComponent() {
  return (
    <Footer container className='border dark:border-b-gray-800 dark:border-x-transparent border-t-2 border-x-0 dark:border-t-0 border-gray-300 rounded-none dark:bg-[rgb(32,38,43)] z-10'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='grid w-full justify-between sm:flex md:grid-cols-1'>
          <div className='mb-3'>
            <Link to="/" className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white focus:outline-none focus:ring-0'>
              <span className='ml-0 text-2xl font-semibold'><span className='bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text'>Agate</span> Ltd.</span>
            </Link>
          </div>
          <div className='grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6 ml-10'>
            <div>
              <Footer.Title title='Follow Us' />
              <Footer.LinkGroup col>
                <Footer.Link href='https://www.instagram.com' target='_blank' rel='noopener nopreferrer'>
                  Instagram
                </Footer.Link>
                <Footer.Link href='https://www.facebook.com' target='_blank' rel='noopener nopreferrer'>
                  Facebook
                </Footer.Link>
                <Footer.Link href='https://www.x.com' target='_blank' rel='noopener nopreferrer'>
                  X (Twitter)
                </Footer.Link>

              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title='Services' />
              <Footer.LinkGroup col>
                <Footer.Link href='/about' rel='noopener nopreferrer' >
                  About Us
                </Footer.Link>
                <Footer.Link href='/portfolio' rel='noopener nopreferrer'>
                  Portfolio
                </Footer.Link>
                <Footer.Link href='/about' rel='noopener nopreferrer'>
                  Contact Us
                </Footer.Link>

              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title='Legal' />
              <Footer.LinkGroup col>
                <Footer.Link href='#'>
                  Privacy Policy
                </Footer.Link>
                <Footer.Link href='#'>
                  Terms &amp; Conditions
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />
        <div className='w-full sm:flex sm:items-center sm:justify-between'>
          <Footer.Copyright href='#' by="Creative Agency" year={new Date().getFullYear()} />
          <div className='flex gap-6 sm:mt-0 mt-4 sm:justify-center'>
            <Footer.Icon href='https://www.instagram.com' icon={BsInstagram} />
            <Footer.Icon href='https://www.facebook.com' icon={BsFacebook} />
            <Footer.Icon href='https://www.x.com' icon={BsTwitterX} />
          </div>
        </div>
      </div>
    </Footer>
  );
}
