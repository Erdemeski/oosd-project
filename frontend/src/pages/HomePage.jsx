import React, { useEffect, useState } from 'react'
import '../styles/home.css'
import { useSelector } from 'react-redux';
/* import AdvCard from '../components/AdvCard';
 */import { Link } from 'react-router-dom';
import FooterBanner from '../components/FooterBanner';
import AdvCardSkeleton from '../components/AdvCardSkeleton';
import { motion } from 'framer-motion';
import custService from '../assets/home_page/customer_services.png'
import { FaWhatsapp } from 'react-icons/fa';

const stats = [
  { id: 1, name: 'Years of creative excellence', value: '5', suffix: ' years', prefix: 'for' },
  { id: 2, name: 'Client satisfaction rate', value: '99.2', suffix: '%', prefix: '🌟' },
  { id: 3, name: 'Campaigns delivered monthly', value: '150', suffix: ' offers', prefix: '>' },
]

const useCounter = (end, duration = 2000, trigger = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentCount = Math.floor(progress * end);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, trigger]);

  return count;
};

export default function HomePage() {
  const { currentUser } = useSelector((state) => state.user);
  const { currency } = useSelector((state) => state.currency);
  const [recentAdvs, setRecentAdvs] = useState([])
  const [loading, setLoading] = useState(true);

  /*   useEffect(() => {
      try {
        const fetchRecentAdvs = async () => {
          const res = await fetch(``);
          const data = await res.json();
          if (res.ok) {
            setLoading(false);
            setRecentAdvs(data.advertisements);
          }
        };
        fetchRecentAdvs();
      } catch (error) {
        setLoading(true);
        console.log(error.message);
      }
    }, []);
   */

  return (
    <div>
      <section className='flex flex-col lg:flex-row transition-all duration-500'>
        <div className="relative isolate px-6 lg:px-8 flex-1">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-0"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-[pulse_7s_ease-in-out_infinite]"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-50 transform-gpu overflow-hidden blur-3xl sm:-top-0 translate-y-[1000px] lg:translate-x-[-500px] rotate-180"
          >
            <div
              style={{
                clipPath:
                  'polygon(90% 10%, 100% 20%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 1% 100%, 76.1% 97.7%, 85% 110%, 90% 125%, 95% 140%, 98% 155%, 100% 170%, 200% 200%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#63ff97] to-[#668aff] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-[pulse_6s_ease-in-out_infinite]"
            />
          </div>

          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-balance text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-7xl">
                Creative solutions that drive results
              </h1>
              <p className="mt-8 text-pretty text-lg font-medium text-gray-500 dark:text-gray-400 sm:text-xl/8">
                Transform your brand with innovative <br /> advertising strategies that captivate and convert! <span className='text-2xl'>🚀</span>
              </p>
              <div className="mt-10 flex flex-row sm:flex-col items-center justify-center gap-4">
                <Link to='/public-menu'>
                  <button className="px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:scale-105 transition-transform">
                    View Our Portfolio
                  </button>
                </Link>
                <Link to='/about'>
                  <span className="px-6 py-3 mr-2 text-md font-semibold text-black dark:text-white hover:font-bold transition-all duration-300">
                    → Contact Us
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-20rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-10"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-[1000px] bg-gradient-to-tr from-[#ff9a8b] to-[#ff6a88] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-[pulse_7s_ease-in-out_infinite]"
            />
          </div>
        </div>

        {/*         <div className='flex-1 m-auto'>
          <div className='flex flex-row gap-3 px-3 sm:px-10 md:px-20 lg:pr-16 lg:pl-10 xl:pr-24 2xl:pr-44 md:flex-row items-center justify-center transition-all duration-500'>

          </div>
        </div>
 */}      </section>

      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="pt-2 pb-16 sm:pb-20 sm:pt-2">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.dl
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 gap-x-8 gap-y-12 text-center lg:grid-cols-3"
            >
              {stats.map((stat, index) => {
                const [isVisible, setIsVisible] = useState(false);
                const count = useCounter(parseFloat(stat.value), 2000, isVisible);

                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    onViewportEnter={() => setIsVisible(true)}
                    className="mx-auto flex max-w-xs flex-col gap-y-2 z-10"
                  >
                    <motion.dt
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-lg text-gray-500 dark:text-gray-400"
                    >
                      {stat.name}
                    </motion.dt>
                    <motion.dd
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="order-first text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl flex flex-row items-center justify-center gap-2"
                    >
                      {stat.prefix && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="text-3xl font-extralight text-gray-500 dark:text-gray-400"
                        >
                          {stat.prefix}
                        </motion.span>
                      )}
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        {stat.value.includes('.') ? count.toFixed(0) : count}{stat.suffix}
                      </motion.span>
                    </motion.dd>
                  </motion.div>
                );
              })}
            </motion.dl>
          </div>
        </div>
      </motion.section>

      {loading === false ? (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className='mt-0 sm:mt-10'
        >
          {recentAdvs && <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-center font-semibold text-3xl mt-5 z-40 relative'
          >
            Our Latest Campaigns
          </motion.h1>}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='flex flex-wrap gap-5 m-5 justify-center'
          >
            {recentAdvs && recentAdvs.map((advertisement) => (
              <motion.div
                key={advertisement._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full sm:w-[430px]"
              >
                {/*                 <AdvCard advertisement={advertisement} currency={currency} />
 */}              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className='mt-0 sm:mt-10 z-10'
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-center font-semibold text-3xl mt-5 z-50 relative'
          >
            Our Latest Campaigns
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='flex flex-wrap gap-5 m-5 justify-center'
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full sm:w-[430px]"
              >
                <AdvCardSkeleton />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      <section>
        <div>
          <FooterBanner />
        </div>
      </section>
    </div>
  )
}