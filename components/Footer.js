import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import generateChallengeQuery from '../queries/auth/generateChallengeQuery';
import refreshAuthQuery from '../queries/auth/refreshAuthQuery';
import authenticateQuery from "../queries/auth/authenticateQuery";
import verifyQuery from "../queries/auth/verifyQuery";
import networks from "../utils/metamask/networks";
import { useMutation, useQuery } from "@apollo/client";
import { getSigner } from "../utils/ethers/ethers-service";

export default function Footer(props) {
    const { status, connect, account, chainId, switchChain, ethereum } = useMetaMask();

    const { data: challengeData, loading: challengeLoading, error: challengeError, refetch: challengeRefetch } = useQuery(generateChallengeQuery, {
        variables: {
            request: { address: account },
        },
    });

    const { data: verifyData, loading: verifyLoading, error: verifyError, refetch: verifyRefetch } = useQuery(verifyQuery, {
        variables: {
            request: { accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" },
        },
    });
    const [ refreshMutation, { data: refreshData, loading: refreshLoading, error: refreshError }] = useMutation(refreshAuthQuery);
    const [ authMutation, { data: authData, loading: authLoading, error: authError }] = useMutation(authenticateQuery);

    const [buttonText, setButtonText] = useState('Connect');
    const [loginText, setLoginText] = useState("Login")
    const [isConnected, setIsConnected] = useState(false);
    const [prevAddress, setPrevAddress] = useState();

    const handleConnect = async () => {
        if (!window.ethereum) {
            setButtonText("Please enable metamask")
        } else {
            switch (status) {
                case "connected":
                    setButtonText(account);
                    await handleChain();

                    if (!isConnected) {
                        await login();
                        setIsConnected(true);
                        return;
                    }

                    if (prevAddress !== account) {
                        setPrevAddress(account);
                        window.location.reload();
                        return
                    }
                    
                    if (!prevAddress) {
                        setPrevAddress(account);
                    }
                    
                    return;
                case "connecting":
                case "notConnected":
                    await connect()
                    await handleChain();
                    return;
                case "unavailable":
                    setButtonText("MM unavailable");
                    return;
                    
            };
        }   
    }

    const handleChain = async() => {
        if (chainId != networks.mumbai) {
            await switchChain(networks.mumbai);
        };
    }

    const login = async () => {
        if (account) {
            const accessTokenDataToCompare = JSON.parse(window.localStorage.getItem('access_token'))
            const refreshTokenDataToCompare = JSON.parse(window.localStorage.getItem('refresh_token'))
            
            const address = account;
    
            if (!accessTokenDataToCompare ||
                address !== accessTokenDataToCompare.address ||
                address !== refreshTokenDataToCompare.address) {
                // we request a challenge from the server
                await loginFromScratch(address)
            } else {
                if (Date.now() > accessTokenDataToCompare.expireTime) {
                    if (Date.now() > refreshTokenDataToCompare.expireTime) {
                        await loginFromScratch(address)
                    } else {
                        const newAccessTokenResponse = await refreshMutation({
                            variables: {
                                request: {
                                    refreshToken: refreshTokenDataToCompare.value
                                }
                            }
                        })
                        const newAccessToken = (await newAccessTokenResponse)?.data?.refresh?.accessToken;
                        newAccessToken ? setAccessToken(newAccessToken, address) : alert('error')
                    }
                } else {
                    setLoginText("Logged in. Try again if stuck")
                    return
                }
            }
        } else {
            alert('Connect your address please')
        }
    }

    const setTokens = (accessToken, refreshToken, address) => {
        setAccessToken(accessToken, address);
        setRefreshToken(refreshToken, address);
    }
 
    const setAccessToken = (accessToken, address) => {
        window.localStorage.setItem('access_token', JSON.stringify({
            value: accessToken,
            expireTime: Date.now() + 1800000, // 30 minutes
            address
        }));
        props.triggerClient();
    }

    const setRefreshToken = (refreshToken, address) => {
        window.localStorage.setItem('refresh_token', JSON.stringify({
            value: refreshToken,
            expireTime: Date.now() + 86400000, // 1 day
            address
        }));
        props.triggerClient();
    }

    const loginFromScratch = async (address) => {
        // we request a challenge from the server
        const challengeResponse = await challengeRefetch({ request: { address }});
        const signer = getSigner();
        // sign the text with the wallet
        const signature = await signer.signMessage(challengeResponse.data.challenge.text);
        
        const accessTokens = await authMutation({
            variables: {
                request: {
                    address,
                    signature
                }
            }
        });
            // you now have the accessToken and the refreshToken
            // {
            //  data: {
            //   authenticate: {
            //    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjB4YjE5QzI4OTBjZjk0N0FEM2YwYjdkN0U1QTlmZkJjZTM2ZDNmOWJkMiIsInJvbGUiOiJub3JtYWwiLCJpYXQiOjE2NDUxMDQyMzEsImV4cCI6MTY0NTEwNjAzMX0.lwLlo3UBxjNGn5D_W25oh2rg2I_ZS3KVuU9n7dctGIU",
            //    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjB4YjE5QzI4OTBjZjk0N0FEM2YwYjdkN0U1QTlmZkJjZTM2ZDNmOWJkMiIsInJvbGUiOiJyZWZyZXNoIiwiaWF0IjoxNjQ1MTA0MjMxLCJleHAiOjE2NDUxOTA2MzF9.2Tdts-dLVWgTLXmah8cfzNx7sGLFtMBY7Z9VXcn2ZpE"
            //   }
            // }
        const { accessToken, refreshToken } = accessTokens.data.authenticate;

        setTokens(accessToken, refreshToken, address);
        setLoginText("Logged in. Try again if stuck")
    }
    
    useEffect(() => {
        handleConnect();
    }, [status, account, chainId])

    return (
        <div class="mt-5 mr-5 flex justify-end">
            <button
                onClick={handleConnect}
                class="w-auto bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            >
                {buttonText}
            </button>
            <button
                onClick={login}
                class="ml-5 w-auto bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            >
                {loginText}
            </button>
        </div>
    )
}