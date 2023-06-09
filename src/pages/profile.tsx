import { Title } from '@tremor/react'
import Layout from 'expensasaures/components/layout/Layout'
import { useAuthStore } from 'expensasaures/shared/stores/useAuthStore'
import { defaultOptions } from 'expensasaures/shared/utils/lottie'
import Lottie from 'react-lottie'
import { shallow } from 'zustand/shallow'
import loadingProfile from '../lottie/loadingProfile.json'

const profile = () => {
    const { userInfo, user } = useAuthStore(store => ({ userInfo: store.userInfo, user: store.user }), shallow)


    return (
        <Layout>
            <div className="pt-16 px-4 max-w-[1200px] mx-auto w-full">
                {!userInfo ? <>
                    <Lottie options={defaultOptions(loadingProfile)}
                        height={'60vh'}
                        width={400}
                    /></> : <div>
                    <div className='flex items-center'>
                        <div className='w-[120px] mr-10 text-3xl h-[120px] bg-blue-600 text-white rounded-full shadow-subtle flex items-center justify-center'>
                            {userInfo.name[0]}
                        </div>
                        <div className="grid grid-cols-[120px_1fr]">
                            <Title className='font-thin'>Email</Title>
                            <Title>
                                {userInfo.email}
                            </Title>
                            <Title className='font-thin'>Name</Title>
                            <Title>
                                {userInfo.name}
                            </Title>
                        </div>
                        {/* {JSON.stringify(locale.listCurrencies())} */}
                    </div>
                </div>}
            </div>
        </Layout >
    )
}

export default profile