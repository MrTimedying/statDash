import React from 'react';
import {
  Card,
  Progress,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Button,
  Divider
} from 'antd';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SimulationProgressProps {
  isVisible: boolean;
  currentPair: number;
  totalPairs: number;
  currentSimulation: number;
  totalSimulations: number;
  phase: 'running_simulations' | 'analyzing_results';
  pairName?: string;
  estimatedTimeRemaining?: number;
  onCancel?: () => void;
}

export const SimulationProgress: React.FC<SimulationProgressProps> = ({
  isVisible,
  currentPair,
  totalPairs,
  currentSimulation,
  totalSimulations,
  phase,
  pairName,
  estimatedTimeRemaining,
  onCancel
}) => {
  if (!isVisible) return null;

  const overallProgress = totalPairs > 0
    ? ((currentPair - 1) / totalPairs) * 100 + (currentSimulation / totalSimulations) * (100 / totalPairs)
    : 0;

  const pairProgress = totalSimulations > 0 ? (currentSimulation / totalSimulations) * 100 : 0;

  const getPhaseDescription = () => {
    switch (phase) {
      case 'running_simulations':
        return pairName
          ? `Running simulations for "${pairName}"`
          : `Running simulations for pair ${currentPair} of ${totalPairs}`;
      case 'analyzing_results':
        return 'Analyzing results and generating statistics';
      default:
        return 'Processing...';
    }
  };

  const getPhaseIcon = () => {
    switch (phase) {
      case 'running_simulations':
        return <ExperimentOutlined spin />;
      case 'analyzing_results':
        return <BarChartOutlined />;
      default:
        return <LoadingOutlined />;
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  return (
    <Card
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        minWidth: '500px',
        maxWidth: '600px'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '48px', color: 'var(--ant-color-primary)' }}>
            {getPhaseIcon()}
          </div>
          <Title level={3} style={{ margin: 0 }}>
            Running Multi-Pair Analysis
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            {getPhaseDescription()}
          </Text>
        </Space>
      </div>

      <Divider />

      {/* Overall Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px' }}>
          <Text strong>Overall Progress</Text>
        </div>
        <Progress
          percent={Math.round(overallProgress)}
          status="active"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <Text type="secondary">
            Pair {currentPair} of {totalPairs} • Simulation {currentSimulation.toLocaleString()} of {totalSimulations.toLocaleString()}
          </Text>
        </div>
      </div>

      {/* Current Pair Progress */}
      {phase === 'running_simulations' && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>Current Pair Progress</Text>
          </div>
          <Progress
            percent={Math.round(pairProgress)}
            status="active"
            strokeColor="#1890ff"
          />
        </div>
      )}

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Statistic
            title="Pairs Completed"
            value={currentPair - 1}
            suffix={`/ ${totalPairs}`}
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Simulations Run"
            value={((currentPair - 1) * totalSimulations) + currentSimulation}
            formatter={(value) => value.toLocaleString()}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Total Simulations"
            value={totalPairs * totalSimulations}
            formatter={(value) => value.toLocaleString()}
            valueStyle={{ color: '#cf1322' }}
          />
        </Col>
      </Row>

      {/* Time Estimate */}
      {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Space>
            <ClockCircleOutlined />
            <Text>
              Estimated time remaining: {formatTime(estimatedTimeRemaining)}
            </Text>
          </Space>
        </div>
      )}

      {/* Performance Info */}
      <div style={{ marginBottom: '24px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 Tip: Large simulations may take several minutes. You can continue using other browser tabs while this runs.
        </Text>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div style={{ textAlign: 'center' }}>
          <Button
            danger
            onClick={onCancel}
            size="large"
          >
            Cancel Analysis
          </Button>
        </div>
      )}
    </Card>
  );
};