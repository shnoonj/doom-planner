
"use client"

import { supabase } from "../lib/supabase"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Download,
  Pencil,
  Plus,
  RotateCcw,
} from "lucide-react"
import { toPng } from "html-to-image"

const DEFAULT_ROLES = [
  "🏥 Hospital 1",
  "🏥 Hospital 2",
  "🏥 Hospital 3",
  "🏥 Hospital 4",
  "⛽ Refinery 1",
  "⛽ Refinery 2",
  "🧪 Science Hub",
  "📡 Info Center",
  "🔫 Arsenal",
  "⚔️ Mercenary",
  "🚀 Silo",
  "🎯 Hunters",
]

const DAY_NAMES = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
]

function getCurrentWeekDays() {
  const today = new Date()

  const currentDay =
    today.getDay() === 0
      ? 7
      : today.getDay()

  const monday = new Date(today)

  monday.setDate(
    today.getDate() - currentDay + 1
  )

  return DAY_NAMES.map((day, index) => {
    const date = new Date(monday)

    date.setDate(monday.getDate() + index)

    const dayNumber = String(
      date.getDate()
    ).padStart(2, "0")

    return `${dayNumber} ${day}`
  })
}

const TRAIN_ROLES =
  getCurrentWeekDays()

const LEGENDS = {
  "IN SILO": "bg-[#FFE600]",
  "OUT SILO": "bg-[#FF9F1C]",
  SUPPORT: "bg-[#4CC9F0]",
  "1ST OBJ": "bg-[#9D4EDD]",
  "2ND OBJ": "bg-[#FF4D4D]",
}

function createDefaultTeam() {
  return {
    playerStates: {} as Record<string, string>,
    players: Array.from(
      { length: DEFAULT_ROLES.length },
      () => ["", "", ""]
    ),
    subs: Array(10).fill(""),
    cellColors: {} as Record<string, string>,
  }
}

function createTrainTeam() {
  return {
    playerStates: {} as Record<string, string>,
    players: Array.from(
      { length: TRAIN_ROLES.length },
      () => ["", ""]
    ),
    subs: [],
    cellColors: {} as Record<string, string>,
  }
}

export default function Page() {
  const [players, setPlayers] = useState([
    "BLADE",
    "LUNA",
    "MERCY",
    "TALIC",
  ])

  const [editing, setEditing] =
    useState(false)

  const [activeLegend, setActiveLegend] =
    useState("")

  const [activeTab, setActiveTab] =
    useState<"A" | "B" | "C">("A")

  const [isExporting, setIsExporting] =
    useState(false)

  const [teams, setTeams] = useState({
    A: createDefaultTeam(),
    B: createDefaultTeam(),
    C: createTrainTeam(),
  })

  const exportRef =
    useRef<HTMLDivElement>(null)

  const currentTeam = teams[activeTab]

  const isTrainTab = activeTab === "C"

  const currentRoles = isTrainTab
    ? TRAIN_ROLES
    : DEFAULT_ROLES

  const mondayDate = useMemo(() => {
    const today = new Date()

    const currentDay =
      today.getDay() === 0
        ? 7
        : today.getDay()

    const monday = new Date(today)

    monday.setDate(
      today.getDate() - currentDay + 1
    )

    const day = String(
      monday.getDate()
    ).padStart(2, "0")

    const month = String(
      monday.getMonth() + 1
    ).padStart(2, "0")

    return `${day}/${month}`
  }, [])

  
const hasLoaded = useRef(false)

useEffect(() => {
  async function loadData() {
    const { data } = await supabase
      .from("doom_state")
      .select("data")
      .eq("id", 1)
      .single()

    if (data?.data) {
      if (data.data.players)
        setPlayers(data.data.players)

      if (data.data.teams)
        setTeams(data.data.teams)
    }

    hasLoaded.current = true
  }

  loadData()
}, [])

useEffect(() => {
  if (!hasLoaded.current) return

  async function saveData() {
    await supabase
      .from("doom_state")
      .update({
        data: {
          players,
          teams,
        },
      })
      .eq("id", 1)
  }

  saveData()
}, [players, teams])
  

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) =>
      a.localeCompare(b)
    )
  }, [players])

  const greenCount = useMemo(() => {
    return players.filter(
      (p) =>
        currentTeam.playerStates[p] ===
        "green"
    ).length
  }, [players, currentTeam])

  const pinkCount = useMemo(() => {
    return players.filter(
      (p) =>
        currentTeam.playerStates[p] ===
        "pink"
    ).length
  }, [players, currentTeam])

  const greenPlayers = useMemo(() => {
    return sortedPlayers.filter(
      (p) =>
        currentTeam.playerStates[p] ===
        "green"
    )
  }, [sortedPlayers, currentTeam])

  const pinkPlayers = useMemo(() => {
    return sortedPlayers.filter(
      (p) =>
        currentTeam.playerStates[p] ===
        "pink"
    )
  }, [sortedPlayers, currentTeam])

  const assignedPlayers = useMemo(() => {
    return currentTeam.players.flat()
  }, [currentTeam])

  function cyclePlayer(player: string) {
    const current =
      currentTeam.playerStates[player]

    let next = "green"

    if (current === "green") {

      if (
        pinkCount >=
        (isTrainTab ? 100 : 10)
      )
        return

      next = "pink"

    } else if (current === "pink") {

      next = "none"

    } else {

      if (
        greenCount >=
        (isTrainTab ? 100 : 20)
      )
        return

      next = "green"
    }

    setTeams((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        playerStates: {
          ...prev[activeTab]
            .playerStates,
          [player]: next,
        },
      },
    }))
  }

  function addPlayer() {
    const name = prompt("Player name")

    if (!name) return

    const updated = [
      ...players,
      name.toUpperCase(),
    ].sort((a, b) =>
      a.localeCompare(b)
    )

    setPlayers(updated)
  }

  function removePlayer(player: string) {
    setPlayers((prev) =>
      prev.filter((p) => p !== player)
    )
  }

  function resetTeam() {
    setTeams((prev) => ({
      ...prev,
      [activeTab]:
        activeTab === "C"
          ? createTrainTeam()
          : createDefaultTeam(),
    }))
  }

  function updatePlayerCell(
    row: number,
    col: number,
    value: string
  ) {
    const updated = [...currentTeam.players]

    updated[row] = [...updated[row]]
    updated[row][col] = value

    setTeams((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        players: updated,
      },
    }))
  }

  function updateSub(
    index: number,
    value: string
  ) {
    const updated = [...currentTeam.subs]

    updated[index] = value

    setTeams((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        subs: updated,
      },
    }))
  }

  function applyLegendColor(key: string) {
    if (!activeLegend) return

    const current =
      currentTeam.cellColors[key]

    setTeams((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        cellColors: {
          ...prev[activeTab]
            .cellColors,
          [key]:
            current === activeLegend
              ? ""
              : activeLegend,
        },
      },
    }))
  }

  async function exportImage() {
    if (!exportRef.current) return

    setIsExporting(true)

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    )

    const dataUrl = await toPng(
      exportRef.current,
      {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f4f4f5",
      }
    )

    setIsExporting(false)

    const link =
      document.createElement("a")

    link.download = `${activeTab}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800 p-3 md:p-5">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex items-start justify-between">

          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              DOOM #1515
            </h1>
          </div>

          <div className="flex flex-col items-end gap-1">

            <div className="flex gap-2">

              <button
                onClick={() =>
                  setActiveTab("A")
                }
                className={`px-2 py-1 rounded-lg text-[12px] font-bold border transition whitespace-nowrap ${
                  activeTab === "A"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white border-zinc-300"
                }`}
              >
                TEAM A
              </button>

              <button
                onClick={() =>
                  setActiveTab("B")
                }
                className={`px-2 py-1 rounded-lg text-[12px] font-bold border transition whitespace-nowrap ${
                  activeTab === "B"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white border-zinc-300"
                }`}
              >
                TEAM B
              </button>

              <button
                onClick={() =>
                  setActiveTab("C")
                }
                className={`px-2 py-1 rounded-lg text-[12px] font-bold border transition whitespace-nowrap ${
                  activeTab === "C"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white border-zinc-300"
                }`}
              >
                TRAINS
              </button>
            </div>

            <div className="text-[11px] text-zinc-500 pr-1">
              {activeTab === "A"
                ? "13H FRANCE"
                : activeTab === "B"
                ? "22H FRANCE"
                : "TRAIN SCHEDULE"}
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-300" />

        {/* INSCRIPTION */}

        <div className="space-y-4">

          <div className="flex flex-wrap gap-2">

            {sortedPlayers.map((player) => {
              const state =
                currentTeam.playerStates[
                  player
                ]

              return (
                <div
                  key={player}
                  className="relative"
                >
                  <button
                    onClick={() =>
                      cyclePlayer(player)
                    }
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      state === "green"
                        ? "bg-[#5CFC38]"
                        : state === "pink"
                        ? "bg-[#FFE600]"
                        : "bg-zinc-200"
                    }`}
                  >
                    {player}
                  </button>

                  {editing && (
                    <button
                      onClick={() =>
                        removePlayer(player)
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[10px]"
                    >
                      -
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="text-[11px] text-zinc-500 flex gap-4">

            <div>
              <span className="text-green-600 font-medium">
                Inscrits :
              </span>{" "}
              {greenCount}/
              {isTrainTab
                ? "100"
                : "20"}
            </div>

            <div>
              <span className="text-yellow-500 font-medium">
                {isTrainTab
                  ? "VIP"
                  : "Subs"}
                :
              </span>{" "}
              {pinkCount}/
              {isTrainTab
                ? "100"
                : "10"}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-2">

            <button
              onClick={addPlayer}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 text-white text-[11px]"
            >
              <Plus size={12} />
              Add
            </button>

            {isTrainTab && (
              <button
                onClick={() => {
                  const updatedStates: any = {}

                  sortedPlayers.forEach(
                    (p) => {
                      updatedStates[p] =
                        "green"
                    }
                  )

                  setTeams((prev) => ({
                    ...prev,
                    [activeTab]: {
                      ...prev[activeTab],
                      playerStates:
                        updatedStates,
                    },
                  }))
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#5CFC38] text-black text-[11px]"
              >
                ALL
              </button>
            )}

            <button
              onClick={() =>
                setEditing(!editing)
              }
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500 text-white text-[11px]"
            >
              <Pencil size={12} />
              Edit
            </button>

            <button
              onClick={resetTeam}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500 text-white text-[11px]"
            >
              <RotateCcw size={12} />
              Reset
            </button>

            <button
              onClick={exportImage}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-900 bg-white text-zinc-900 text-[11px]"
            >
              <Download size={12} />
              PNG
            </button>
          </div>
        </div>

        <div className="border-t border-zinc-300" />

        {/* TABLE */}

        <div
          ref={exportRef}
          className={`space-y-4 ${
            isExporting
              ? "w-[1200px]"
              : "overflow-hidden"
          }`}
        >

          {!isTrainTab && (
            <div className="flex flex-wrap gap-2">

              {Object.entries(
                LEGENDS
              ).map(([label, color]) => (
                <button
                  key={label}
                  onClick={() =>
                    setActiveLegend(
                      activeLegend === label
                        ? ""
                        : label
                    )
                  }
                  className={`${color} px-2 py-1 rounded-lg text-[11px] border transition ${
                    activeLegend === label
                      ? "border-zinc-900 scale-105"
                      : "border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">

            <table className="border-collapse min-w-[560px] w-full text-sm">

              <thead>

                <tr>

                  <th
                    className={`sticky left-0 z-20 bg-zinc-200 border border-zinc-300 p-2 text-left text-xs font-bold ${
                      isTrainTab
                        ? "min-w-[85px]"
                        : "min-w-[125px]"
                    }`}
                  >
                    {isTrainTab
                      ? mondayDate
                      : "ROLE"}
                  </th>

                  <th className="border border-zinc-300 p-2 bg-zinc-200 min-w-[120px] text-xs font-bold">
                    {isTrainTab
                      ? "PILOT"
                      : "PLAYER 1"}
                  </th>

                  <th className="border border-zinc-300 p-2 bg-zinc-200 min-w-[120px] text-xs font-bold">
                    {isTrainTab
                      ? "VIP"
                      : "PLAYER 2"}
                  </th>

                  {!isTrainTab && (
                    <th className="border border-zinc-300 p-2 bg-zinc-200 min-w-[120px] text-xs font-bold">
                      PLAYER 3
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>

                {currentRoles.map(
                  (role, rowIndex) => (
                    <tr key={role}>

                      <td
                        className={`sticky left-0 z-10 bg-zinc-200 border border-zinc-300 px-2 py-2 whitespace-nowrap text-xs font-bold ${
                          isTrainTab
                            ? "w-[85px]"
                            : ""
                        }`}
                      >
                        {role}
                      </td>

                      {[
                        0,
                        1,
                        ...(isTrainTab
                          ? []
                          : [2]),
                      ].map((colIndex) => {
                        const key = `${rowIndex}-${colIndex}`

                        const color =
                          currentTeam
                            .cellColors[
                            key
                          ]

                        return (
                          <td
                            key={key}
                            onClick={() =>
                              applyLegendColor(
                                key
                              )
                            }
                            className={`border border-zinc-300 p-1 transition ${
                              activeLegend
                                ? "cursor-pointer"
                                : ""
                            } ${
                              color
                                ? LEGENDS[
                                    color as keyof typeof LEGENDS
                                  ]
                                : "bg-white"
                            }`}
                          >

                            <select
                              disabled={
                                !!activeLegend
                              }
                              value={
                                currentTeam
                                  .players[
                                  rowIndex
                                ]?.[
                                  colIndex
                                ] || ""
                              }
                              onChange={(
                                e
                              ) =>
                                updatePlayerCell(
                                  rowIndex,
                                  colIndex,
                                  e.target
                                    .value
                                )
                              }
                              className={`w-full bg-transparent px-2 py-1 rounded-md text-xs outline-none ${
                                activeLegend
                                  ? "appearance-none pointer-events-none"
                                  : ""
                              }`}
                            >

                              <option value="">
                                --
                              </option>

                              {(
                                isTrainTab
                                  ? colIndex === 0
                                    ? [
                                        ...greenPlayers,
                                        ...pinkPlayers,
                                      ]
                                    : pinkPlayers
                                  : greenPlayers
                              ).map(
                                (
                                  player
                                ) => {
                                  const used =
                                    assignedPlayers.includes(
                                      player
                                    )

                                  return (
                                    <option
                                      key={
                                        player
                                      }
                                      value={
                                        player
                                      }
                                    >
                                      {used
                                        ? `${player} ✔`
                                        : player}
                                    </option>
                                  )
                                }
                              )}
                            </select>
                          </td>
                        )
                      })}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {!isTrainTab && (
            <div className="space-y-3">

              <h3 className="text-sm font-medium text-zinc-500">
                SUBS
              </h3>

              <div className="grid grid-cols-2 gap-2">

                {currentTeam.subs.map(
                  (sub, index) => {

                    const color =
                      currentTeam
                        .cellColors[
                        `sub-${index}`
                      ]

                    return (
                      <div
                        key={index}
                        onClick={() =>
                          applyLegendColor(
                            `sub-${index}`
                          )
                        }
                        className={`border border-zinc-300 rounded-lg p-1 transition ${
                          activeLegend
                            ? "cursor-pointer"
                            : ""
                        } ${
                          color
                            ? LEGENDS[
                                color as keyof typeof LEGENDS
                              ]
                            : "bg-white"
                        }`}
                      >

                        <select
                          disabled={
                            !!activeLegend
                          }
                          value={sub}
                          onChange={(e) =>
                            updateSub(
                              index,
                              e.target
                                .value
                            )
                          }
                          className={`w-full bg-transparent px-2 py-1 rounded-md text-xs outline-none ${
                            activeLegend
                              ? "appearance-none pointer-events-none"
                              : ""
                          }`}
                        >

                          <option value="">
                            --
                          </option>

                          {pinkPlayers.map(
                            (
                              player
                            ) => (
                              <option
                                key={player}
                                value={player}
                              >
                                {player}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}