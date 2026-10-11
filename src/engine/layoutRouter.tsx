/**
 * CVMaker AI - Layout Router
 * Routes any template ID to the matching rendering engine.
 */

import React, { forwardRef } from 'react';
import { JobResumeData, MarriageBiodataData, DesignSettingsState } from '../data/initialData';
import { getTemplateById, TemplateType } from '../data/catalog';
import { JobTemplateEngine } from '../components/JobTemplateEngine';
import { MarriageTemplateEngine } from '../components/MarriageTemplateEngine';

export interface LayoutRouterProps {
  templateId: string;
  mode: TemplateType;
  jobData: JobResumeData;
  marriageData: MarriageBiodataData;
  settings?: DesignSettingsState;
  className?: string;
}

export const LayoutRouter = forwardRef<HTMLDivElement, LayoutRouterProps>(({
  templateId,
  mode,
  jobData,
  marriageData,
  settings,
  className = ''
}, ref) => {
  const template = getTemplateById(templateId, mode);

  return (
    <div ref={ref} className={`cvmaker-printable-root w-full ${className}`}>
      {template.type === 'job' ? (
        <JobTemplateEngine
          data={jobData}
          template={template}
          settings={settings}
        />
      ) : (
        <MarriageTemplateEngine
          data={marriageData}
          template={template}
          settings={settings}
        />
      )}
    </div>
  );
});

LayoutRouter.displayName = 'LayoutRouter';
