import React, { useEffect, useState } from 'react';
import { Network, ShieldAlert, Cpu, RefreshCw, Info, Database } from 'lucide-react';
import { fetchKnowledgeGraphApi } from '../lib/api';

const KnowledgeGraphView = ({ selectedRepo = 'sentinel/core-engine', onSelectRefactor }) => {
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadGraph = async () => {
      setIsLoading(true);
      try {
        const data = await fetchKnowledgeGraphApi(selectedRepo);
        if (isMounted && data) {
          setGraphData(data);
          if (data.nodes && data.nodes.length > 0) {
            setSelectedNode(data.nodes[0]);
          }
        }
      } catch (err) {
        console.error('Knowledge graph loading error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadGraph();
    return () => { isMounted = false; };
  }, [selectedRepo]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Notification Card */}
      <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
            <Network className="w-6 h-6 text-[#b7f15b]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#dfe4de]">Engineering Knowledge Graph</h2>
            <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
              Interactive topological visualizer for co-change coupling, module complexity, and bus factor risks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsLoading(true);
              fetchKnowledgeGraphApi(selectedRepo).then(d => { setGraphData(d); setIsLoading(false); });
            }}
            className="h-10 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono uppercase text-[#dfe4de] hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 text-[#b7f15b] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-Index Topology</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas Container */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4 min-h-[460px] relative flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="text-xs font-mono text-[#c3c9b2]">
              Repository Topology: <span className="text-[#b7f15b] font-bold">{selectedRepo}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-[#b7f15b]"><span className="w-2.5 h-2.5 rounded-full bg-[#b7f15b]"></span> Low Risk</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Warning</span>
              <span className="flex items-center gap-1 text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Critical</span>
            </div>
          </div>

          {/* SVG Topology Visualizer */}
          <div className="h-80 w-full relative flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Computing Co-Change Coupling Vectors...</span>
              </div>
            ) : !graphData?.nodes ? (
              <div className="text-xs font-mono text-[#8d937e]">No graph nodes indexed.</div>
            ) : (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 300">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Render Edges (Co-Change Links) */}
                {graphData.links.map((link, idx) => {
                  const srcIndex = graphData.nodes.findIndex(n => n.id === link.source);
                  const tgtIndex = graphData.nodes.findIndex(n => n.id === link.target);
                  if (srcIndex === -1 || tgtIndex === -1) return null;

                  const srcX = (srcIndex / Math.max(graphData.nodes.length - 1, 1)) * 460 + 70;
                  const srcY = 150 + Math.sin(srcIndex * 1.8) * 80;
                  const tgtX = (tgtIndex / Math.max(graphData.nodes.length - 1, 1)) * 460 + 70;
                  const tgtY = 150 + Math.sin(tgtIndex * 1.8) * 80;

                  const isSelectedEdge = selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target);

                  return (
                    <line
                      key={idx}
                      x1={srcX}
                      y1={srcY}
                      x2={tgtX}
                      y2={tgtY}
                      stroke={isSelectedEdge ? '#b7f15b' : 'white'}
                      strokeOpacity={isSelectedEdge ? '0.6' : '0.12'}
                      strokeWidth={isSelectedEdge ? '2.5' : '1'}
                      strokeDasharray={link.couplingRisk === 'High' ? '4 2' : 'none'}
                    />
                  );
                })}

                {/* Render Graph Nodes */}
                {graphData.nodes.map((node, idx) => {
                  const x = (idx / Math.max(graphData.nodes.length - 1, 1)) * 460 + 70;
                  const y = 150 + Math.sin(idx * 1.8) * 80;
                  const isSelected = selectedNode?.id === node.id;
                  const color = node.riskCategory === 'CRITICAL' ? '#ffb4ab' : node.riskCategory === 'WARNING' ? '#fbbf24' : '#b7f15b';

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 14 : 10}
                        fill="#1c211e"
                        stroke={color}
                        strokeWidth={isSelected ? 3 : 2}
                        filter={isSelected ? 'url(#glow)' : 'none'}
                        className="transition-all duration-300"
                      />
                      <circle cx={x} cy={y} r={isSelected ? 5 : 3} fill={color} />

                      <text
                        x={x}
                        y={y + 24}
                        fill={isSelected ? '#b7f15b' : '#c3c9b2'}
                        fontSize={isSelected ? '11' : '10'}
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#181d1a] border border-white/5 text-xs font-mono text-[#8d937e] flex items-center justify-between">
            <span>Tip: Click on any module node above to inspect its co-change coupling vectors and bus factor metadata.</span>
            <span className="text-[#b7f15b] font-bold">{graphData?.nodesCount || 0} Nodes / {graphData?.edgesCount || 0} Edges</span>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-5">
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#b7f15b]" />
              <h3 className="text-base font-bold text-[#dfe4de]">Node Inspection Drawer</h3>
            </div>
            <p className="text-xs font-mono text-[#c3c9b2] mt-0.5">Granular Module Graph Property Matrix</p>
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                <div className="text-xs font-mono text-[#8d937e]">MODULE PATH</div>
                <div className="font-mono text-xs text-[#dfe4de] font-bold break-all">{selectedNode.fullPath}</div>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  selectedNode.riskCategory === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#b7f15b]/20 text-[#b7f15b]'
                }`}>
                  {selectedNode.riskCategory}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#181d1a] border border-white/5">
                  <div className="text-[10px] text-[#8d937e]">CYCLOMATIC SCORE</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">{selectedNode.complexityScore}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#181d1a] border border-white/5">
                  <div className="text-[10px] text-[#8d937e]">BUG FREQUENCY</div>
                  <div className="text-lg font-bold text-[#ffb4ab] mt-1">{selectedNode.bugFrequency} Bugs</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1.5 font-mono text-xs">
                <div className="text-[#8d937e]">PRIMARY BUS FACTOR OWNER</div>
                <div className="text-[#b7f15b] font-bold">{selectedNode.busFactorOwner}</div>
                <div className="text-[11px] text-[#c3c9b2]/70 pt-1">
                  84% of commit volume authored by single contributor. High knowledge concentration risk.
                </div>
              </div>

              {onSelectRefactor && (
                <button
                  onClick={() => onSelectRefactor(selectedNode.fullPath, selectedNode.complexityScore)}
                  className="w-full h-10 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#b7f15b]/20"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Refactor AST Module</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs font-mono text-[#8d937e]">Select a node on the canvas to inspect topology details.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphView;
