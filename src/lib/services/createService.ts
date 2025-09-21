import type Service from './Service';
import type { ServiceType } from './Service';
import CdnService from './CdnService';
import MockService from './MockService';

const createService = (type: ServiceType): Service => {
  switch (type.source) {
  case 'cdn':
    return new CdnService(type.url);
  case 'mock':
    return new MockService();
  default:
    throw new Error(`Unknown blog service type: ${(type as ServiceType).source}`);
  }
};

export default createService;