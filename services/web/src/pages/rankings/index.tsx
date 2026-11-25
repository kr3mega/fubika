import React, { useState, useEffect, useRef } from 'react'
import style from './style.module.css'
import { WrapperComponent } from '../../components/components.export'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'

interface RankedUser {
    id: number
    name: string
    safe_name: string
    pfp: string
    banner: string
    rank: number
    pp: number
    acc: number
    playtime: number
    playcount: number
    max_combo: number
    total_score: number
    ranked_score: number
    level: number
    ss_count: number
    ssh_count: number
    s_count: number
    sh_count: number
    a_count: number
    country: string
}

const STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

const STATE_NAMES: Record<string, string> = {
    AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
    BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
    GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
    PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
    SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
    BR: 'Brasil', XX: 'Desconhecido',
}

const MODES = [
    { id: 0, label: 'Standard' },
    { id: 1, label: 'Taiko' },
    { id: 2, label: 'Catch' },
    { id: 3, label: 'Mania' },
]

const resolveFlagCode = (country?: string) => {
    const code = (country || '').trim().toUpperCase()
    return !code || code === 'XX' ? 'BR' : code
}

const fallbackToBr = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/flags/BR.svg'
}

const PaginationArrows: React.FC<{
    page: number
    isLastPage: boolean
    onPrev: () => void
    onNext: () => void
    children?: React.ReactNode
}> = ({ page, isLastPage, onPrev, onNext, children }) => (
    <div className={style.arrows}>
        <button type="button" aria-label="Página anterior" className={style.arrow} disabled={page === 1} onClick={onPrev}>
            <img src="/arrow_pagination.svg" alt="" />
        </button>
        <button
            type="button"
            aria-label="Próxima página"
            className={`${style.arrow} ${style.arrowNext}`}
            disabled={isLastPage}
            onClick={onNext}
        >
            <img src="/arrow_pagination.svg" alt="" />
        </button>
        {children}
    </div>
)

const GlobalRanking: React.FC = () => {
    const [activeMode, setActiveMode] = useState(0)
    const [page, setPage] = useState(1)
    const [selectedState, setSelectedState] = useState('')
    const [result, setResult] = useState<{ key: string; players: RankedUser[] }>({ key: '', players: [] })
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const queryKey = `${activeMode}:${page}:${selectedState}`
    const loading = result.key !== queryKey
    const players = loading ? [] : result.players

    useEffect(() => {
        let cancelled = false

        api.get<RankedUser[]>('/ranking/global', {
            params: { mode: activeMode, page, country: selectedState || undefined },
        })
            .then((res) => {
                if (!cancelled) {
                    setResult({ key: queryKey, players: Array.isArray(res.data) ? res.data : [] })
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error('Erro no ranking:', error)
                    setResult({ key: queryKey, players: [] })
                }
            })

        return () => {
            cancelled = true
        }
    }, [activeMode, page, selectedState, queryKey])

    useEffect(() => {
        if (!isDropdownOpen) return
        const onMouseDown = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsDropdownOpen(false)
                triggerRef.current?.focus()
            }
        }
        document.addEventListener('mousedown', onMouseDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [isDropdownOpen])

    const isLastPage = players.length < 50
    const onPrev = () => setPage((p) => Math.max(1, p - 1))
    const onNext = () => {
        if (!isLastPage) setPage((p) => p + 1)
    }

    const selectState = (uf: string) => {
        setSelectedState(uf)
        setPage(1)
        setIsDropdownOpen(false)
        triggerRef.current?.focus()
    }

    return (
        <WrapperComponent>
            <div className={style.pageWrapper}>
                <div className={style.rankingContainer}>
                    <div className={style.modeSelector}>
                        {MODES.map((mode) => (
                            <button
                                key={mode.id}
                                type="button"
                                className={`${style.modeBtn} ${activeMode === mode.id ? style.activeMode : ''}`}
                                onClick={() => {
                                    setActiveMode(mode.id)
                                    setPage(1)
                                }}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>

                    <div className={style.tableCard}>
                        <Link to="/" className={style.backButton} aria-label="Voltar para a página inicial">
                            <img src="/arrow_icon.svg" alt="" />
                        </Link>

                        <div className={style.titleContainer}>
                            <h2 className={style.title}>Colocações</h2>

                            <div className={style.stateSelectorWrapper} ref={dropdownRef}>
                                <button
                                    ref={triggerRef}
                                    type="button"
                                    className={`${style.stateSelectorButton} ${isDropdownOpen ? style.stateSelectorButtonActive : ''}`}
                                    onClick={() => setIsDropdownOpen((open) => !open)}
                                    aria-haspopup="listbox"
                                    aria-expanded={isDropdownOpen}
                                    aria-label="Filtrar colocações por estado"
                                >
                                    <span className={style.stateSelectorCurrent}>
                                        <img src={`/flags/${selectedState || 'BR'}.svg`} alt="" className={style.stateSelectorFlag} onError={fallbackToBr} />
                                        <span>{selectedState ? STATE_NAMES[selectedState] : 'Brasil (Geral)'}</span>
                                    </span>
                                    <svg className={`${style.dropdownChevron} ${isDropdownOpen ? style.dropdownChevronRotated : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className={style.dropdownList} role="listbox" aria-label="Estados">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={!selectedState}
                                            className={`${style.dropdownOption} ${!selectedState ? style.dropdownOptionSelected : ''}`}
                                            onClick={() => selectState('')}
                                        >
                                            <img src="/flags/BR.svg" alt="" className={style.dropdownOptionFlag} />
                                            <span>Brasil (Geral)</span>
                                        </button>
                                        {STATES.map((uf) => (
                                            <button
                                                key={uf}
                                                type="button"
                                                role="option"
                                                aria-selected={selectedState === uf}
                                                className={`${style.dropdownOption} ${selectedState === uf ? style.dropdownOptionSelected : ''}`}
                                                onClick={() => selectState(uf)}
                                            >
                                                <img src={`/flags/${uf}.svg`} alt="" className={style.dropdownOptionFlag} onError={fallbackToBr} />
                                                <span>{STATE_NAMES[uf]}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <PaginationArrows page={page} isLastPage={isLastPage} onPrev={onPrev} onNext={onNext} />
                        </div>

                        <div className={style.listSection}>
                            <div className={style.tableHeader}>
                                <span className={style.colRank} />
                                <span className={style.colPlayer} />
                                <span className={style.colPP}>Performance (Pontuação)</span>
                                <span className={style.colAcc}>Precisão</span>
                                <span className={style.colPlays}>Jogadas Totais</span>
                            </div>

                            <div className={style.rowsContainer}>
                                {loading || players.length === 0 ? (
                                    <div className={style.emptyState}>
                                        {loading ? 'Carregando ranking...' : 'Nenhum jogador encontrado neste modo.'}
                                    </div>
                                ) : (
                                    players.map((user) => {
                                        const rawCode = (user.country || '').trim().toUpperCase()
                                        const flagCode = resolveFlagCode(user.country)
                                        const countryLabel = STATE_NAMES[rawCode] || STATE_NAMES[flagCode] || rawCode || 'Brasil'

                                        return (
                                            <Link key={user.id} to={`/profile/${user.id}`} className={style.playerRow}>
                                                <div className={style.colRank}>
                                                    <span className={style.rankHash}>#</span>
                                                    <span className={style.rankValue}>{user.rank}</span>
                                                </div>
                                                <div className={style.colPlayer}>
                                                    <div className={style.nameInfo}>
                                                        <img src={`/flags/${flagCode}.svg`} alt={countryLabel} title={countryLabel} className={style.flagIcon} onError={fallbackToBr} />
                                                        <span className={style.username}>{user.name}</span>
                                                    </div>
                                                </div>
                                                <div className={`${style.colPP} ${style.ppValue}`}>{Math.round(user.pp).toLocaleString()}pp</div>
                                                <div className={`${style.colAcc} ${style.statValue}`}>{user.acc.toFixed(2)}%</div>
                                                <div className={`${style.colPlays} ${style.statValue}`}>{user.playcount.toLocaleString()}</div>
                                            </Link>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        <div className={style.footerContainer}>
                            <PaginationArrows page={page} isLastPage={isLastPage} onPrev={onPrev} onNext={onNext}>
                                <img src="/cat_head.png" alt="" className={style.cat} />
                            </PaginationArrows>
                        </div>
                    </div>
                </div>
            </div>
        </WrapperComponent>
    )
}

export default GlobalRanking
