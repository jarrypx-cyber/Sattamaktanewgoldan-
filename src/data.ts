export function getLiveMarketResult(market, currentIST) {
  // Current time ko minutes mein convert karein
  const currentMinutes = currentIST.getHours() * 60 + currentIST.getMinutes();
  
  const openMinutes = parseTimeToMinutes(market.openTime);
  const closeMinutes = parseTimeToMinutes(market.closeTime);

  // Default values set karein agar data nahi hai
  const openPanna = market.currentOpenPanna || '***';
  const jodi = market.currentJodi || '**';
  const closePanna = market.currentClosePanna || '***';

  // Check karein ki kya market ka data pehle se available hai
  const hasResult = market.currentJodi && market.currentJodi !== '**' && market.currentJodi !== '';

  if (hasResult) {
    // Agar manually admin ne result daal diya hai, toh hamesha display karo!
    return {
      openPanna,
      jodi,
      closePanna,
      isLive: currentMinutes >= openMinutes && currentMinutes <= closeMinutes
    };
  }

  // Agar result abhi tak update nahi hua hai tabhi "Awaited" status dikhayein
  return {
    openPanna: '***',
    jodi: 'Awaited',
    closePanna: '***',
    isLive: false
  };
}
