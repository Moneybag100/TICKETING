import React, { useState } from 'react';
import styles from './ticketDetails.module.scss';
import {
  useContract,
  useContractRead,
  useContractWrite,
  Web3Button,
} from '@thirdweb-dev/react';
import { images } from '../../../utils/images';

import { ethers } from 'ethers';
import {
  convertToIntegar,
  convertUnixToTime,
  incrementIndex,
  decreaseIndex,
  contractAddress,
  checkValidity,
} from '../../../utils/utils';
import { motion } from 'framer-motion';
import Modal from '../../Modal';
import SuccessModal from '../SuccessModal';

const TicketDetails = (props) => {
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [showError, setShowError] = useState(false);
  const _ticketId = Number(props.ticketIDs[props.index]);
  const { contract } = useContract(contractAddress);
  const { mutateAsync, isLoading: load } = useContractWrite(
    contract,
    'confirmTicketUse'
  );
  const { data, isLoading } = useContractRead(contract, 'getTicket', _ticketId);

  const handleSuccess = (result) => {
    setIsSuccessful(true);
    alert('succcessful');
  };

  const handleError = (error) => {
    setShowError(true);
    alert('oops something went wrong');
  };

  if (isLoading || data === undefined) {
    return (
      <section className={styles.ticketContainer}>
        <p className={styles.ticketContainer__loadingText}>
          In a moment please...
        </p>
      </section>
    );
  }
  let ticketType = data[0],
    validity = data[1]._hex,
    amount = data[2]._hex,
    owner = data[3],
    dateCreated = data[4],
    ticketID = data[5]._hex,
    ipfs = data[6],
    used = data[7],
    confirmTicketUse = data[8];

  const weiValue = ethers.BigNumber.from(`${convertToIntegar(amount)}`);
  const etherValue = ethers.utils.formatEther(weiValue);

  return (
    <>
      <section className={styles.ticketContainer}>
        <div className={styles.barCodeContainer}>
          <motion.button
            className={styles.barCodeContainer__circleChevronLeft}
            whileTap={{ scale: 0.8 }}
            onClick={() =>
              props.setIndex(
                decreaseIndex(props.index, props.ticketIDs.length - 1)
              )
            }
          >
            <img src={images.chevronRight} alt='circleCheron_left' />
          </motion.button>
          <motion.button
            className={styles.barCodeContainer__circleChevronRight}
            whileTap={{ scale: 0.8 }}
            onClick={() =>
              props.setIndex(
                incrementIndex(props.index, props.ticketIDs.length - 1)
              )
            }
          >
            <img src={images.chevronRight} alt='circleCheron_Right' />
          </motion.button>

          <img src={images.QR} alt='Qr_Code_img' />
          <div className={styles.barCodeContainer__ticketAmount}>
            <div className={styles.infoContainer}>
              <p className={styles.infoTitle}>Sold for {`${etherValue} ETH`}</p>
              <p className={styles.infoText}>
                {convertUnixToTime(dateCreated)}
              </p>
            </div>
            <div className={styles.infoContainer}>
              <p className={styles.infoTitle}>{used ? 'used' : 'Not Used'}</p>
              <p className={styles.infoText}>
                {used !== confirmTicketUse
                  ? 'Awaiting'
                  : used
                  ? 'used'
                  : 'Not Used'}
              </p>
            </div>
            <img src={images.nut1} alt='nut_icon' className={styles.nut1} />
            <img src={images.nut2} alt='nut_icon' className={styles.nut2} />
          </div>
        </div>

        <div className={styles.ticketInfoContainer}>
          <div className={styles.ticketInfoContainer__ticketDetailsTitle}>
            <img src={images.info} alt='info_icon' />
            <h2>Ticket Details</h2>
          </div>

          <div className={styles.ticketInfoContainer__ticketDetails}>
            <div className={styles.ticketInfoContainer__ticketDetailsInfo}>
              <h3>Ticket Type:</h3>
              <p>{ticketType}</p>
            </div>
            <div className={styles.ticketInfoContainer__ticketDetailsInfo}>
              <h3>Status</h3>
              <p>
                {used !== confirmTicketUse
                  ? 'Confirmed for use'
                  : confirmTicketUse
                  ? 'used'
                  : 'Not Used'}
              </p>
            </div>
          </div>
          <div className={styles.ticketInfoContainer__ticketDetails}>
            <div className={styles.ticketInfoContainer__ticketDetailsInfo}>
              <h3>Ticket ID:</h3>
              <p>{convertToIntegar(ticketID)}</p>
            </div>
            <div className={`${styles.ticketInfoContainer__ticketDetailsInfo}`}>
              <h3>ipfs CID:</h3>
              <p>{ipfs ? ipfs : 'N/A'}</p>
            </div>
          </div>
          <div className={styles.ticketInfoContainer__ticketDetails}>
            <div className={styles.ticketInfoContainer__ticketDetailsInfo}>
              <h3>Validity Until</h3>
              <p className={styles.validityText}>
                {convertUnixToTime(validity)}{' '}
                {((confirmTicketUse &&
                  !used &&
                  checkValidity(validity) === 'Expired') ||
                  (!used &&
                    !confirmTicketUse &&
                    checkValidity(validity) === 'Expired')) && (
                  <span className={styles.expiredText}>Expired</span>
                )}
                {confirmTicketUse && used ? <span>Ticket Used</span> : ''}
              </p>
            </div>
            <div className={styles.ticketInfoContainer__ticketDetailsInfo}>
              <Web3Button
                contractAddress={contractAddress}
                action={() => mutateAsync([ticketID])}
                onSuccess={(result) => handleSuccess(result)}
                onError={(error) => handleError(error)}
                isDisabled={
                  confirmTicketUse || checkValidity(validity) === 'Expired'
                    ? true
                    : false
                }
                className={`${styles.confirmUseButton} ${
                  (confirmTicketUse || checkValidity(validity) === 'Expired') &&
                  styles.isDisabled
                }`}
              >
                Use Ticket
              </Web3Button>
            </div>
          </div>
        </div>
      </section>
      {load && (
        <Modal>
          <SuccessModal isLoading={true} />
        </Modal>
      )}
      {showError && (
        <Modal onClick={setShowError(false)}>
          <SuccessModal error={true} isLoading={false} />
        </Modal>
      )}
      {isSuccessful && (
        <Modal onClick={setIsSuccessful(false)}>
          <SuccessModal isSuccessful={isSuccessful} isLoading={false} />
        </Modal>
      )}
    </>
  );
};

export default TicketDetails;
