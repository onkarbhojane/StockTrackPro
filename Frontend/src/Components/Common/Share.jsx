import React from 'react';
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon,
} from 'react-share';

const SocialShare = (props) => {
  const url = props.url; // Replace with your actual website URL
  const title = props.titile;

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <FacebookShareButton url={url} quote={title}>
        <FacebookIcon size={30} round />
      </FacebookShareButton>

      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={30} round />
      </TwitterShareButton>

      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={30} round />
      </WhatsappShareButton>
    </div>
  );
};

export default SocialShare;
