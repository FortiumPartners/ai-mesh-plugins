/**
 * Terminal multiplexer adapters
 * Re-exports from @ai-mesh/multiplexer-adapters shared package
 *
 * This file maintains backward compatibility for existing code that imports
 * from './adapters'. New code should import from '@ai-mesh/multiplexer-adapters'.
 */

const {
  BaseMultiplexerAdapter,
  WeztermAdapter,
  ZellijAdapter,
  TmuxAdapter,
  MultiplexerDetector
} = require('@ai-mesh/multiplexer-adapters');

module.exports = {
  BaseMultiplexerAdapter,
  WeztermAdapter,
  ZellijAdapter,
  TmuxAdapter,
  MultiplexerDetector
};
