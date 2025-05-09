function pearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const avgX = x.reduce((a, b) => a + b, 0) / n;
    const avgY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0, denomX = 0, denomY = 0;

    for (let i = 0; i < n; i++) {
        const dx = x[i] - avgX;
        const dy = y[i] - avgY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }

    return denomX && denomY ? (numerator / Math.sqrt(denomX * denomY)) : 0;
}

module.exports = { pearsonCorrelation };
