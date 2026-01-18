from nautilus_trader.config import StrategyConfig
from nautilus_trader.trading.strategy import Strategy

class VWAP_Intraday(Strategy):
    """
    An institutional-style execution algorithm that compares current price to VWAP.
    """
    def __init__(self, config: StrategyConfig):
        super().__init__(config)
        self.threshold = config.threshold

    def on_start(self):
        self.log.info("Starting VWAP Execution Algo")
