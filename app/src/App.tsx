import React from 'react'
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import chat, { ChatItem, useChatEvents } from './chat'
import useStorage from './components/hooks/useStorage'
import MainScreen from './components/screens/Main'
import SetupScreen from './components/screens/Setup'
import Header from './components/primitives/Header'
import { ChannelInfo, Settings } from './utils'

export default function App() {
  return (
    <Router initialEntries={['/setup']}>
      <InnerApp />
    </Router>
  )
}

function InnerApp() {
  const [settings, setSettings] = useStorage<Settings>('settings', {
    autoConnect: true,
    subLuck: 2,
    numberOfWinners: 1,
    followersOnly: true,
    chatCommand: '',
    winnerMessage: 'PartyHat @name won!',
    sendMessages: false,
  })
  const [client, setClient] = React.useState<ReturnType<typeof chat> | null>(null)
  const [channelInfo, setChannelInfo] = useStorage<ChannelInfo>('channelInfo', {}, (c) => {
    console.info('[client][app]', c)
    if (c.login) return null
    console.info('[client][app][startClient]')
    setClient(chat(c))
  })
  const onNewChat = React.useCallback((chat: ChatItem) => {
    console.info('[chat]', chat)
  }, [])
  const [chatPaused, setChatPaused] = React.useState(false)
  const [chatEvents, resetChat] = useChatEvents(chatPaused, onNewChat)
  const chatEventsRef = React.useRef(chatEvents)
  React.useEffect(() => {
    chatEventsRef.current = chatEvents
  }, [chatEvents])
  React.useEffect(() => {
    window['myApp'].setTitle(channelInfo.login, !!client)
  }, [channelInfo.login, client])
  return (
    <>
      <Header client={client} resetChat={resetChat} setClient={setClient} channelInfo={channelInfo} />
      <Switch>
        <Route path="/" exact>
          <MainScreen
            client={client}
            chatEvents={chatEvents}
            settings={settings}
            setSettings={setSettings}
            isConnected={!!client}
            channelInfo={channelInfo}
            chatPaused={chatPaused}
            setChatPaused={setChatPaused}
            resetChat={resetChat}
          />
        </Route>
        <Route path="/setup" exact>
          <SetupScreen resetChat={resetChat} setClient={setClient} channel={channelInfo} setChannel={setChannelInfo} />
        </Route>
      </Switch>
      <Toaster />
    </>
  )
}
