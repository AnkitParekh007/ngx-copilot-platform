import { Routes } from '@angular/router';
import { LiveDemoComponent } from './live-demo/live-demo.component';
import { ShowcaseComponent } from './showcase/showcase.component';
import { EnterpriseCodebaseShowcaseComponent } from './samples/enterprise-codebase-showcase/enterprise-codebase-showcase.component';
import { EnterpriseDocsWebsiteComponent } from './samples/enterprise-docs-website/enterprise-docs-website.component';
import { DocsLayoutComponent } from './docs/docs-layout.component';
import { DocsHomeComponent } from './docs/docs-home.component';
import { GettingStartedDocComponent } from './docs/getting-started-doc.component';
import { ApiDocComponent } from './docs/api-doc.component';
import { ConfigurationDocComponent } from './docs/configuration-doc.component';
import { AdaptersDocComponent } from './docs/adapters-doc.component';
import { RagSourcesDocComponent } from './docs/rag-sources-doc.component';
import { ToolTimelineDocComponent } from './docs/tool-timeline-doc.component';
import { ApprovalsDocComponent } from './docs/approvals-doc.component';
import { RetailOpsPxmDemoDocComponent } from './docs/retailops-pxm-demo-doc.component';
import { ProductionChecklistDocComponent } from './docs/production-checklist-doc.component';
import { BackendContractDocComponent } from './docs/backend-contract-doc.component';

export const routes: Routes = [
  { path: '', component: LiveDemoComponent },
  { path: 'showcase', component: ShowcaseComponent },
  { path: 'samples/enterprise-codebase', component: EnterpriseCodebaseShowcaseComponent },
  { path: 'samples/enterprise-docs', component: EnterpriseDocsWebsiteComponent },
  {
    path: 'docs',
    component: DocsLayoutComponent,
    children: [
      { path: '', component: DocsHomeComponent },
      { path: 'getting-started', component: GettingStartedDocComponent },
      { path: 'api', component: ApiDocComponent },
      { path: 'configuration', component: ConfigurationDocComponent },
      { path: 'adapters', component: AdaptersDocComponent },
      { path: 'rag-sources', component: RagSourcesDocComponent },
      { path: 'tool-timeline', component: ToolTimelineDocComponent },
      { path: 'approvals', component: ApprovalsDocComponent },
      { path: 'retailops-pxm-demo', component: RetailOpsPxmDemoDocComponent },
      { path: 'production-checklist', component: ProductionChecklistDocComponent },
      { path: 'backend-contract', component: BackendContractDocComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
