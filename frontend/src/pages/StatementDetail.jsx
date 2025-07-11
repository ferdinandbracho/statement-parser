import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Play,
  RefreshCw,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter,
  Search,
  BarChart2,
  CreditCard
} from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { 
  useStatement, 
  useTransactions, 
  useAnalysis, 
  useDeleteStatement, 
  useProcessStatement 
} from '../hooks/useStatements'
import ConfirmationModal from '../components/ConfirmationModal'
import { 
  formatCurrency, 
  formatDate, 
  formatFileSize, 
  getStatusInfo, 
  getCategoryInfo, 
  formatStatementName, 
  generateColors,
  capitalize
} from '../utils/helpers'
import { clsx } from 'clsx'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export function StatementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [transactionFilter, setTransactionFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Redirect to statements list if ID is invalid
  useEffect(() => {
    if (!id || id === 'undefined') {
      console.error('Invalid statement ID in URL, redirecting to statements list')
      navigate('/statements', { replace: true })
    }
  }, [id, navigate])

  const { data: statement, isLoading: statementLoading, error: statementError } = useStatement(id)
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(id)
  const { data: analysis, isLoading: analysisLoading } = useAnalysis(id)
  
  const deleteStatement = useDeleteStatement()
  const processStatement = useProcessStatement()

  const handleDownload = () => {
    window.open(`/api/v1/statements/${id}/download`, '_blank');
  }

  const handleDelete = async () => {
    try {
      await deleteStatement.mutateAsync(id)
      navigate('/statements')
    } catch (error) {
      console.error('Error deleting statement:', error)
    }
  }

  const handleProcess = async () => {
    try {
      await processStatement.mutateAsync(id)
    } catch (error) {
      console.error('Error processing statement:', error)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(transactionFilter.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))]

  if (statementError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-foreground">Error al cargar el estado de cuenta</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No se pudo encontrar el estado de cuenta solicitado.
        </p>
        <div className="mt-6">
          <Link to="/statements" className="btn btn-primary btn-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Estados de Cuenta
          </Link>
        </div>
      </div>
    )
  }

  if (statementLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="mt-2 h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="mt-2 h-8 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(statement?.processing_status)

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar estado de cuenta"
        message="¿Estás seguro de que deseas eliminar este estado de cuenta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
        isLoading={deleteStatement.isLoading}
      />
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <svg className="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L4 11.414V18a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
              </svg>
              Inicio
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="rtl:rotate-180 w-3 h-3 text-muted-foreground mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span className="ms-1 text-sm font-medium text-muted-foreground md:ms-2">
                {formatStatementName(statement)}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">
              {formatStatementName(statement)}
            </h1>
            <span className={`badge ${statusInfo.color}`}>
              {statusInfo.name}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {statement?.bank_name || 'Banco no identificado'} • {' '}
            Subido {formatDate(statement?.upload_date, 'relative')}
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex space-x-3">
          {statement?.processing_status === 'uploaded' && (
            <button
              onClick={handleProcess}
              disabled={processStatement.isPending}
              className="btn btn-primary btn-md"
            >
              {processStatement.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Procesar
                </>
              )}
            </button>
          )}
          
          <button onClick={handleDownload} className="btn btn-secondary btn-md">
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger btn-md"
            disabled={deleteStatement.isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Transacciones"
          value={statement?.total_transactions || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Total Gastos"
          value={formatCurrency(statement?.total_debits || 0)}
          icon={TrendingUp}
          color="red"
        />
        <StatCard
          title="Total Ingresos"
          value={formatCurrency(statement?.total_credits || 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Período"
          value={
            statement?.statement_period_start && statement?.statement_period_end
              ? `${formatDate(statement.statement_period_start, 'short')} - ${formatDate(statement.statement_period_end, 'short')}`
              : statement?.statement_period || 'No disponible'
          }
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Processing Status */}
      {statement?.processing_status !== 'processed' && (
        <div className={clsx(
          'rounded-lg border p-4',
          statement?.processing_status === 'processing' && 'bg-yellow-50 border-yellow-200',
          statement?.processing_status === 'failed' && 'bg-red-50 border-red-200',
          statement?.processing_status === 'uploaded' && 'bg-primary/10 border-primary/20'
        )}>
          <div className="flex items-center">
            {statement?.processing_status === 'processing' && (
              <>
                <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin mr-2" />
                <h3 className="text-sm font-medium text-yellow-800">
                  Procesando estado de cuenta...
                </h3>
              </>
            )}
            {statement?.processing_status === 'failed' && (
              <>
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-sm font-medium text-red-800">
                  Error al procesar el estado de cuenta
                </h3>
              </>
            )}
            {statement?.processing_status === 'uploaded' && (
              <>
                <FileText className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-sm font-medium text-primary">
                  Estado de cuenta listo para procesar
                </h3>
              </>
            )}
          </div>
          {statement?.processing_notes && (
            <p className="mt-2 text-sm text-muted-foreground">
              {statement.processing_notes}
            </p>
          )}
        </div>
      )}

      {/* Tabs */}
      {(statement && (statement.processing_status === 'processed' || statement.processing_status === 'COMPLETED' || statement.total_transactions > 0 || transactions.length > 0)) && (
        <div className="bg-card shadow rounded-lg border border-border">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', label: 'Análisis', icon: BarChart2 },
                { id: 'transactions', label: 'Transacciones', icon: CreditCard },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2',
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <DashboardTab analysis={analysis} isLoading={analysisLoading} />
            )}
            {activeTab === 'transactions' && (
              <TransactionsTab 
                transactions={filteredTransactions}
                isLoading={transactionsLoading}
                filter={transactionFilter}
                setFilter={setTransactionFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                uniqueCategories={uniqueCategories}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'text-primary',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  }

  return (
    <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={clsx('h-6 w-6', colorClasses[color] || 'text-muted-foreground')} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-card-foreground">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function TransactionItem({ transaction }) {
  return (
    <div className="flex justify-between py-2 px-3 bg-muted/50 rounded mt-2 text-sm">
      <div>
        <p className="font-medium">{transaction.description}</p>
        <p className="text-muted-foreground text-xs">{formatDate(transaction.date, 'short')}</p>
      </div>
      <div className="text-right">
        <p className={transaction.amount >= 0 ? 'text-success' : 'text-destructive'}>
          {formatCurrency(transaction.amount)}
        </p>
      </div>
    </div>
  )
}

function DashboardTab({ analysis, isLoading }) {
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [transactions, setTransactions] = useState({})
  const { id: statementId } = useParams()
  const { data: transactionsData } = useTransactions(statementId)

  useEffect(() => {
    if (transactionsData) {
      const transactionsByCategory = {}
      transactionsData.forEach(tx => {
        if (!transactionsByCategory[tx.category]) {
          transactionsByCategory[tx.category] = []
        }
        transactionsByCategory[tx.category].push(tx)
      })
      setTransactions(transactionsByCategory)
    }
  }, [transactionsData])

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No hay análisis disponible para este estado de cuenta
        </p>
      </div>
    )
  }

  // Check if we're in dark mode
  const isDark = document.documentElement.classList.contains('dark')
  
  // Prepare chart data
  const categoryData = {
    labels: analysis.categories?.map(cat => getCategoryInfo(cat.category).name) || [],
    datasets: [{
      data: analysis.categories?.map(cat => cat.total_amount) || [],
      backgroundColor: generateColors(analysis.categories?.length || 0, isDark),
      borderWidth: 2,
      borderColor: isDark ? '#1f2937' : '#ffffff'
    }]
  }

  const transactionData = {
    labels: analysis.categories?.map(cat => getCategoryInfo(cat.category).name) || [],
    datasets: [{
      label: 'Número de Transacciones',
      data: analysis.categories?.map(cat => cat.transaction_count) || [],
      backgroundColor: isDark ? 'rgba(96, 165, 250, 0.6)' : 'rgba(59, 130, 246, 0.6)',
      borderColor: isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary/10 p-4 rounded-lg">
          <h4 className="font-medium text-primary">Balance Neto</h4>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(analysis.net_amount || 0)}
          </p>
        </div>
        <div className="bg-success/10 p-4 rounded-lg">
          <h4 className="font-medium text-success">Total Ingresos</h4>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(analysis.total_credits || 0)}
          </p>
        </div>
        <div className="bg-destructive/10 p-4 rounded-lg">
          <h4 className="font-medium text-destructive">Total Gastos</h4>
          <p className="text-2xl font-bold text-destructive">
            {formatCurrency(analysis.total_debits || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div>
          <h3 className="text-lg font-medium mb-4">Distribución por Categorías</h3>
          <div className="h-64">
            <Pie 
              data={categoryData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: isDark ? '#e5e7eb' : '#374151'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Transaction Count by Category */}
        <div>
          <h3 className="text-lg font-medium mb-4">Transacciones por Categoría</h3>
          <div className="h-64">
            <Bar 
              data={transactionData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: isDark ? '#e5e7eb' : '#374151'
                    },
                    grid: {
                      color: isDark ? '#374151' : '#e5e7eb'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: isDark ? '#e5e7eb' : '#374151'
                    },
                    grid: {
                      color: isDark ? '#374151' : '#e5e7eb'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

{/* Detailed Category Analysis */}
      <div>
        <h3 className="text-lg font-medium mb-4">Análisis Detallado por Categoría</h3>
        <div className="space-y-4">
          {analysis.categories?.map((category) => {
            const categoryInfo = getCategoryInfo(category.category)
            const isExpanded = expandedCategory === category.category
            const categoryTransactions = transactions[category.category] || []
            
            return (
              <div key={category.category} className="border border-border rounded-lg overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCategory(category.category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">
                        {React.createElement(categoryInfo.icon, { className: 'w-5 h-5' })}
                      </span>
                      <h4 className="font-medium text-foreground">{categoryInfo.name}</h4>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-foreground mr-4">
                        {formatCurrency(category.total_amount)}
                      </span>
                      <svg 
                        className={`w-5 h-5 text-muted-foreground transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                    <div>
                      <span className="text-muted-foreground">Transacciones:</span>
                      <p className="font-medium">{category.transaction_count}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Promedio:</span>
                      <p className="font-medium">{formatCurrency(category.average_amount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">% del total:</span>
                      <p className="font-medium">{category.percentage_of_total?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frecuencia:</span>
                      <p className="font-medium">
                        {(category.transaction_count / (analysis.total_transactions || 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                {isExpanded && categoryTransactions.length > 0 && (
                  <div className="border-t border-border p-4 bg-muted/50">
                    <h5 className="font-medium text-sm text-foreground mb-2">Transacciones:</h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {categoryTransactions.map((tx) => (
                        <TransactionItem key={tx.id} transaction={tx} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TransactionsTab({ 
  transactions, 
  isLoading, 
  filter, 
  setFilter, 
  categoryFilter, 
  setCategoryFilter, 
  uniqueCategories 
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="all">Todas las categorías</option>
            {uniqueCategories.map(category => {
              const categoryInfo = getCategoryInfo(category)
              return (
                <option key={category} value={category}>
                  {categoryInfo.name}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Monto</th>
              <th>Método</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const categoryInfo = getCategoryInfo(transaction.category)
              return (
                <tr key={transaction.id}>
                  <td className="whitespace-nowrap">
                    {formatDate(transaction.transaction_date, 'short')}
                  </td>
                  <td>
                    <div className="max-w-xs truncate" title={transaction.description}>
                      {transaction.description}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${categoryInfo.color} inline-flex items-center gap-2`}>
                      {React.createElement(categoryInfo.icon, { className: 'w-3 h-3' })}
                      {categoryInfo.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <span className={clsx(
                      'font-medium',
                      transaction.transaction_type === 'credit' ? 'text-success' : 'text-foreground'
                    )}>
                      {transaction.transaction_type === 'credit' ? '+' : ''}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">
                      {capitalize(transaction.categorization_method || 'manual')}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron transacciones</p>
        </div>
      )}
    </div>
  )
}
