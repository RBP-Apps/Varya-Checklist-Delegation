//Scoring Page for Performance Tracking
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { BarChart3, TrendingUp, Award, Calendar, ArrowLeft, Users, Target, CheckCircle2, Trophy, Star } from "lucide-react"
import AdminLayout from "../components/layout/AdminLayout"

// Configuration object - Same URL and credentials as your existing apps
const CONFIG = {
  // Google Apps Script URL (same as your checklist)
  APPS_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbxDEgWct4VVx7Oh81zMxwl1UsvretjqrCy9X7XlOoIqy9LXmGAAIlx-6Wvx3dZha0Xr/exec",

  // Sheet name to work with - "Scoring" sheet
  SHEET_NAME: "Scoring",

  // Page configuration
  PAGE_CONFIG: {
    title: "Performance Scoring Dashboard",
    description: "Team member performance tracking and scoring",
  },
}

function ScoringPage() {
  const [scoringData, setScoringData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState("current") // current, all
  const [selectedMember, setSelectedMember] = useState("all")
  const [membersList, setMembersList] = useState([])
  const [userRole, setUserRole] = useState("")
  const [username, setUsername] = useState("")

  // Date formatting utilities (consistent with your existing code)
  const formatDateToDDMMYYYY = (date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const parseGoogleSheetsDate = (dateStr) => {
    if (!dateStr) return ""

    if (typeof dateStr === "string" && dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateStr
    }

    if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
      const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateStr)
      if (match) {
        const year = Number.parseInt(match[1], 10)
        const month = Number.parseInt(match[2], 10)
        const day = Number.parseInt(match[3], 10)
        return `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${year}`
      }
    }

    try {
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return formatDateToDDMMYYYY(date)
      }
    } catch (error) {
      console.error("Error parsing date:", error)
    }

    return dateStr
  }

  const parseDateFromDDMMYYYY = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null
    const parts = dateStr.split("/")
    if (parts.length !== 3) return null
    return new Date(parts[2], parts[1] - 1, parts[0])
  }

  // Initialize user data from session storage
  useEffect(() => {
    const role = sessionStorage.getItem("role")
    const user = sessionStorage.getItem("username")
    setUserRole(role || "")
    setUsername(user || "")
  }, [])

  // Fetch scoring data from Google Sheet using the same pattern as your existing code
  const fetchScoringData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?sheet=${CONFIG.SHEET_NAME}&action=fetch`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      const text = await response.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}")
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1)
          data = JSON.parse(jsonString)
        } else {
          throw new Error("Invalid JSON response from server")
        }
      }

      const currentUsername = sessionStorage.getItem("username")
      const currentUserRole = sessionStorage.getItem("role")
      const scores = []
      const membersSet = new Set()

      let rows = []
      if (data.table && data.table.rows) {
        rows = data.table.rows
      } else if (Array.isArray(data)) {
        rows = data
      }

      rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return // Skip header row

        let rowValues = []
        if (row.c) {
          rowValues = row.c.map((cell) => (cell && cell.v !== undefined ? cell.v : ""))
        } else if (Array.isArray(row)) {
          rowValues = row
        }

        const scoreData = {
            _id: `score_${rowIndex}`,
            dateStart: parseGoogleSheetsDate(rowValues[0]) || "", // Column A - Date Start
            dateEnd: parseGoogleSheetsDate(rowValues[1]) || "",   // Column B - Date End
            name: rowValues[2] || "",                             // Column C - Name
            target: parseFloat(rowValues[3]) || 0,                // Column D - Target
            achievement: parseFloat(rowValues[4]) || 0,           // Column E - Achievement
            overallScorePercent: parseFloat(rowValues[5]) || 0,   // Column F - Overall Score %
            notDoneOnTime: parseFloat(rowValues[6]) || 0,         // Column G - Overall Score Not Done on Time
            totalPending: parseInt(rowValues[7]) || 0             // Column H - Total Pending
            }

        membersSet.add(scoreData.name)

        // Filter based on user role
        const isUserMatch = currentUserRole === "admin" || scoreData.name.toLowerCase() === currentUsername.toLowerCase()
        
        if (isUserMatch || currentUserRole === "admin") {
          scores.push(scoreData)
        }
      })

      setScoringData(scores)
      setMembersList(Array.from(membersSet).sort())
      setLoading(false)
    } catch (error) {
      console.error("Error fetching scoring data:", error)
      setError("Failed to load scoring data: " + error.message)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScoringData()
  }, [fetchScoringData])

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    let filteredData = scoringData

    // Filter by member if selected
    if (selectedMember !== "all") {
      filteredData = filteredData.filter(score => score.name === selectedMember)
    }

    // Filter by timeframe (current period only shows latest entry per person)
    if (selectedTimeframe === "current") {
      const latestScores = {}
      filteredData.forEach(score => {
        if (!latestScores[score.name] || 
            parseDateFromDDMMYYYY(score.dateStart) > parseDateFromDDMMYYYY(latestScores[score.name].dateStart)) {
          latestScores[score.name] = score
        }
      })
      filteredData = Object.values(latestScores)
    }

    // Calculate overall statistics
    const totalMembers = filteredData.length
    const totalTarget = filteredData.reduce((sum, score) => sum + score.target, 0)
    const totalAchievement = filteredData.reduce((sum, score) => sum + score.achievement, 0)
    const totalPending = filteredData.reduce((sum, score) => sum + score.totalPending, 0)
    const averageScore = totalMembers > 0 ? filteredData.reduce((sum, score) => sum + score.overallScorePercent, 0) / totalMembers : 0

    // Sort by score for leaderboard
    const sortedScores = [...filteredData].sort((a, b) => b.overallScorePercent - a.overallScorePercent)

    return {
      totalMembers,
      totalTarget,
      totalAchievement,
      totalPending,
      averageScore: Math.round(averageScore * 100) / 100,
      achievementRate: totalTarget > 0 ? Math.round((totalAchievement / totalTarget) * 100) : 0,
      sortedScores,
      filteredData
    }
  }, [scoringData, selectedTimeframe, selectedMember])

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100"
    if (score >= 75) return "text-blue-600 bg-blue-100" 
    if (score >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  

  const getAchievementStatus = (target, achievement) => {
    if (achievement >= target) return { status: "Achieved", color: "text-green-600 bg-green-100" }
    const percentage = target > 0 ? (achievement / target) * 100 : 0
    if (percentage >= 80) return { status: "Near Target", color: "text-yellow-600 bg-yellow-100" }
    return { status: "Below Target", color: "text-red-600 bg-red-100" }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scoring data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-red-600">
            <p className="text-xl">Error loading scoring data</p>
            <p className="mt-2">{error}</p>
            <button
              onClick={fetchScoringData}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              {CONFIG.PAGE_CONFIG.title}
            </h1>
            <p className="text-gray-600 mt-1">{CONFIG.PAGE_CONFIG.description}</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="current">Current Period</option>
                <option value="all">All Records</option>
              </select>
            </div>

            {userRole === "admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Member
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Members</option>
                  {membersList.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Target</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.totalTarget}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Achievement</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.totalAchievement}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Achievement Rate</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.achievementRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.averageScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Leaderboard */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Trophy className="h-5 w-5 text-purple-600 mr-2" />
              Performance Leaderboard
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Achievement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Score
                  </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Score Not Done on Time
                    </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceMetrics.sortedScores.length > 0 ? (
                  performanceMetrics.sortedScores.map((score, index) => {
                    const achievementStatus = getAchievementStatus(score.target, score.achievement)
                    return (
                      <tr key={score._id} className={index < 3 ? "bg-yellow-50" : "hover:bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && (
                              <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{score.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {score.dateStart} - {score.dateEnd}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{score.target}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{score.achievement}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(score.overallScorePercent)}`}>
                            {score.overallScorePercent}%
                          </span>
                        </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                                          {score.notDoneOnTime}
                                    </div>
                                    </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${achievementStatus.color}`}>
                            {achievementStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {score.totalPending > 0 ? (
                              <span className="text-red-600 font-medium">{score.totalPending}</span>
                            ) : (
                              <span className="text-green-600">0</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                      No scoring data available for the selected criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ScoringPage
