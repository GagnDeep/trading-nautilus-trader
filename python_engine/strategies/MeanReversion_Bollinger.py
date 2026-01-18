from nautilus_trader.config import StrategyConfig
from nautilus_trader.trading.strategy import Strategy

class MeanReversion_Bollinger(Strategy):
    """
    A counter-trend strategy that fades moves outside 2 standard deviations.
    """
    def __init__(self, config: StrategyConfig):
        super().__init__(config)
        self.period = config.period
        self.std_dev = config.std_dev

    def on_start(self):
        self.log.info("Starting Bollinger Band Mean Reversion")
