/* eslint-disable */
import React from 'react';
import LogoSvg from '../../../../assets/images/logos/logo2.svg';
import IconSvg from '../../../../assets/images/logos/icon.svg';

const LogoSection = () => {
  return (
    <div className='mb-8 sm:mb-10 md:mb-12'>
      <div className='flex items-center'>
        <img
          src={IconSvg}
          alt='CLOV Icon'
          className='h-8 sm:h-8 md:h-10 w-auto mr-1'
          style={{
            color: 'var(--color-secondary)',
            filter:
              'drop-shadow(3px 3px 0 #C5E1E9) drop-shadow(3px 3px 0 #E4F1F5)',
          }}
        />
        <img
          src={LogoSvg}
          alt='CLOV Logo'
          className='h-8 sm:h-10 md:h-12 w-auto'
        />
      </div>
    </div>
  );
};

export default LogoSection;