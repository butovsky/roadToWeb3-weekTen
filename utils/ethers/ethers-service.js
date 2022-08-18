import { ethers, utils } from 'ethers';
import lensAbi from '../lens/lens-abi.json'
import omitDeep from 'omit-deep';

// This code will assume you are using MetaMask.
// It will also assume that you have already done all the connecting to metamask
// this is purely here to show you how the public API hooks together

export function checkForWindow(func, isReturn) {
  if (typeof window !== "undefined") {
    if (isReturn) {
      return func();
    } else {
      func();
    }
  } else {
    console.log("Window is not defined yet")
  }
}

export function getEthersProvider() {
  return checkForWindow(() => {
    return new ethers.providers.Web3Provider(window.ethereum);
  }, true)
}

export function getSigner() {
    return getEthersProvider()?.getSigner();
}

export const init = async() => {
  const accounts = await checkForWindow(async () => {
    return window.ethereum.request({ method: 'eth_requestAccounts' });
  })
  return accounts[0];
}

export const signedTypeData = (domain, types, value) => {
  const signer = getSigner();
  // remove the __typedname from the signature!
  return signer._signTypedData(
    omitDeep(domain, '__typename'),
    omitDeep(types, '__typename'),
    omitDeep(value, '__typename')
  );
}

export const splitSignature = (signature) => {
    return utils.splitSignature(signature)
}

export const sendTx = (transaction) => {
  const signer = getEthersProvider().getSigner();
  return signer.sendTransaction(transaction);
}

export const followWithSignature = async (typedData) => {
    const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
    const { v, r, s } = splitSignature(signature);

    console.log(getSigner().getAddress())
    const lensHub = new ethers.Contract(
      "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82",
      lensAbi,
      getSigner()
    )

    console.log(await getSigner().getAddress())
    const tx = await lensHub.followWithSig({
      follower: await getSigner().getAddress(),
      profileIds: typedData.value.profileIds,
      datas: typedData.value.datas,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    });
    console.log(tx.hash);
}