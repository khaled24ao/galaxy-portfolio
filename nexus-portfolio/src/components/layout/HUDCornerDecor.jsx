import styles from './HUDCornerDecor.module.css'

const HUDCornerDecor = ({ position = 'all' }) => {
  const positions = {
    topLeft: { top: '20px', left: '20px' },
    topRight: { top: '20px', right: '20px' },
    bottomLeft: { bottom: '20px', left: '20px' },
    bottomRight: { bottom: '20px', right: '20px' }
  }

  const getStyle = (pos) => ({
    ...positions[pos],
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 100
  })

  if (position === 'all') {
    return (
      <>
        <div className={styles.cornerTL} style={getStyle('topLeft')} />
        <div className={styles.cornerTR} style={getStyle('topRight')} />
        <div className={styles.cornerBL} style={getStyle('bottomLeft')} />
        <div className={styles.cornerBR} style={getStyle('bottomRight')} />
      </>
    )
  }

  const posMap = {
    tl: 'topLeft',
    tr: 'topRight',
    bl: 'bottomLeft',
    br: 'bottomRight'
  }

  return <div className={styles[`corner${position.toUpperCase()}`]} style={getStyle(posMap[position])} />
}

export default HUDCornerDecor
