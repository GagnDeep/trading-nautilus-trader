from nautilus_trader.config import StrategyConfig
from nautilus_trader.trading.strategy import Strategy
from nautilus_trader.model.events import DataEvent
from nautilus_trader.model.data import QuoteTick

class Momentum_EMACross(Strategy):
    """
    A classic trend-following strategy using two Exponential Moving Averages.
    """
    def __init__(self, config: StrategyConfig):
        super().__init__(config)
        self.fast_period = config.fast_period
        self.slow_period = config.slow_period
        self.instrument_id = config.instrument_id

    def on_start(self):
        self.log.info(f"Starting EMA Cross Strategy on {self.instrument_id}")
        self.log.info(f"Fast: {self.fast_period}, Slow: {self.slow_period}")

    def on_data(self, data: DataEvent):
        if isinstance(data, QuoteTick):
            # Logic would go here
            pass
