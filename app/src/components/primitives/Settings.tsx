import React, { Dispatch, SetStateAction } from 'react'
import { FaCheck, FaClock, FaTimes } from 'react-icons/fa'
import Countdown, { zeroPad } from 'react-countdown'
import toast from 'react-hot-toast'
import format from 'date-fns/formatDistanceStrict'
import Slider, { SliderInner } from './Slider'
import { Settings } from '../../utils'

const countDownRenderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a complete state
    return <div className="animate-pulse">Finished! Chat is paused, just do the giveaway!</div>
  } else {
    // Render a countdown
    return (
      <span>
        {zeroPad(hours, 2)} : {zeroPad(minutes, 2)} : {zeroPad(seconds, 2)}
      </span>
    )
  }
}

const ONE_MIN = 1000 * 60

interface Props {
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>>
  setChatPaused: Dispatch<SetStateAction<Boolean>>
  resetChat: () => void
}

const Time = React.memo(function Time({ setChatPaused, resetChat }: Pick<Props, 'setChatPaused' | 'resetChat'>) {
  const [active, setActive] = React.useState(false)
  const [value, setValue] = React.useState(ONE_MIN)
  return active ? (
    <div className="flex-1 border border-purple-600 rounded-md flex justify-center items-center text-center relative">
      <Countdown
        renderer={countDownRenderer}
        date={Date.now() + value}
        onComplete={() => {
          toast.success('Timer finished! Chat paused, do a giveaway...', { position: 'bottom-center' })
          setChatPaused(true)
        }}
      />
      <FaTimes
        className="absolute right-3 top-2 text-red-500 select-none cursor-pointer"
        onClick={() => setActive(false)}
        title="Cancel the timer"
      />
    </div>
  ) : (
    <div className="flex-1 border border-purple-600 rounded-md flex relative">
      <div
        className="bg-purple-600 px-2 py-1 flex-0"
        title="Will clear chat, and then pause it after the time, to enable a giveaway with cut off"
      >
        Timer
      </div>
      <div className="px-2 flex-1 flex justify-center items-center">
        <SliderInner min={ONE_MIN} max={ONE_MIN * 30} value={value} step={ONE_MIN} onChange={setValue} />
      </div>
      <div className="flex-1 justify-center items-center text-center flex">
        {format(Date.now() + value, new Date())}
      </div>
      <button
        className="bg-purple-600 px-2 py-1 flex-0 select-none cursor-pointer flex flex-row justify-center items-center gap-1 transition-colors hover:bg-purple-700"
        onClick={() => {
          resetChat()
          setActive(true)
        }}
        title="Will clear chat"
      >
        <FaClock /> Start
      </button>
    </div>
  )
})

export default function SettingsComponent({ settings, setSettings, setChatPaused, resetChat }: Props) {
  return (
    <>
      <div className="flex flex-row gap-2 mt-2">
        <div className="flex flex-row justify-center items-center flex-1">
          <div
            className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md"
            title="This will be sent to chat by your account to tell winners, if Send Message is enabled below"
          >
            Winner Message
          </div>
          <input
            className="bg-gray-700 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1"
            placeholder="Winner Message..."
            value={settings.winnerMessage}
            onChange={(e) => setSettings((s) => ({ ...s, winnerMessage: e.target.value }))}
            title="Chat command to enter - leave empty for none"
          />
        </div>
        <div className="flex flex-row justify-center items-center flex-1">
          <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md" title="Filters messages to include this">
            Chat Command
          </div>
          <input
            className="bg-gray-700 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1"
            placeholder="Empty means any message..."
            value={settings.chatCommand}
            onChange={(e) => setSettings((s) => ({ ...s, chatCommand: e.target.value.trim() }))}
            title="Chat command to enter - leave empty for none"
          />
        </div>
      </div>
      <div className="flex flex-row gap-2 mt-2">
        <div className="flex flex-1 flex-row gap-2">
          <div className="flex-1 border border-purple-600 rounded-md flex relative">
            <div
              className="bg-purple-600 px-2 py-1 flex-0"
              title="Will limit winners to those who follow you, will slow down giveaways"
            >
              Followers Only
            </div>

            <button
              className="flex-1 text-2xl text-center justify-center items-center flex transition-opacity hover:opacity-60"
              onClick={() => setSettings((s) => ({ ...s, followersOnly: !s.followersOnly }))}
            >
              {settings.followersOnly ? <FaCheck /> : <FaTimes />}
            </button>
          </div>
          <div className="flex-1 border border-purple-600 rounded-md flex relative">
            <div
              className="bg-purple-600 px-2 py-1 flex-0"
              title="If enabled, will send messages tagging winners in Twitch chat"
            >
              Send Message
            </div>

            <button
              className="flex-1 text-2xl text-center justify-center items-center flex transition-opacity hover:opacity-60"
              onClick={() => setSettings((s) => ({ ...s, sendMessages: !s.sendMessages }))}
            >
              {settings.sendMessages ? <FaCheck /> : <FaTimes />}
            </button>
          </div>
        </div>
        <Time setChatPaused={setChatPaused} resetChat={() => resetChat()} />
      </div>
      <div className="flex flex-row gap-2 mt-2">
        <Slider
          label="Sub Luck"
          title="Will enter subscribers this amount of times into the giveaways"
          value={settings.subLuck}
          min={1}
          max={10}
          onChange={(val) => setSettings((s) => ({ ...s, subLuck: val }))}
        />
        <Slider
          label="Number of Winners"
          title="How many winners to draw per giveaway"
          value={settings.numberOfWinners}
          min={1}
          max={10}
          onChange={(val) => setSettings((s) => ({ ...s, numberOfWinners: val }))}
        />
      </div>
    </>
  )
}
